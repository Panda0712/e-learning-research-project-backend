import { env } from "@/configs/environment.js";
import { prisma } from "@/lib/prisma.js";
import { COURSE_STATUS } from "@/utils/constants.js";
import ApiError from "@/utils/ApiError.js";
import axios from "axios";
import { StatusCodes } from "http-status-codes";
import { createClient } from "redis";
import { readFile } from "node:fs/promises";
import path from "node:path";
class ChatbotService {
    static GUIDE_FILENAME = "AI_CHATBOT_GUIDE.md";
    geminiBaseUrl = env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com";
    geminiChatPath = env.GEMINI_CHAT_COMPLETIONS_PATH || "/v1beta/openai/chat/completions";
    geminiEmbeddingPath = env.GEMINI_EMBEDDINGS_PATH || "/v1beta/openai/embeddings";
    chatModel = env.GEMINI_CHAT_MODEL || "gemini-2.5-flash";
    embeddingModel = env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";
    embeddingDimensions = Number(env.GEMINI_EMBEDDING_DIMENSIONS || 768);
    qdrantHost = env.QDRANT_HOST || "qdrant";
    qdrantPort = Number(env.QDRANT_PORT || 6334);
    qdrantUseTls = String(env.QDRANT_USE_TLS || "false") === "true";
    qdrantApiKey = env.QDRANT_API_KEY;
    qdrantCollection = env.QDRANT_COLLECTION_NAME || "vector_store";
    qdrantInitializeSchema = String(env.QDRANT_INITIALIZE_SCHEMA || "true") === "true";
    geminiApiKey = env.GEMINI_API_KEY || env.GEMINI_KEY;
    redisHost = env.REDIS_HOST || "localhost";
    redisPort = Number(env.REDIS_PORT || 6379);
    memoryTtlSeconds = Number(env.CHATBOT_MEMORY_TTL_SECONDS || 86400);
    guideContent = "";
    indexed = false;
    indexingPromise = null;
    redisClient = null;
    get qdrantUrl() {
        const protocol = this.qdrantUseTls ? "https" : "http";
        return `${protocol}://${this.qdrantHost}:${this.qdrantPort}`;
    }
    async chat(input) {
        if (!this.geminiApiKey) {
            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Missing Gemini API key configuration.");
        }
        await this.ensureKnowledgeBaseReady();
        const chatHistory = await this.getConversationHistory(input.conversationId);
        const directCourseResponse = await this.tryDirectCourseConsulting(input.question);
        if (directCourseResponse) {
            const answer = this.pickAnswerText(directCourseResponse, "");
            await this.appendConversationHistory(input.conversationId, [
                {
                    role: "user",
                    content: input.question,
                    timestamp: new Date().toISOString(),
                },
                {
                    role: "assistant",
                    content: answer,
                    timestamp: new Date().toISOString(),
                },
            ]);
            return {
                answer,
                type: directCourseResponse.type || "text",
                response: directCourseResponse,
                model: this.chatModel,
                conversationId: input.conversationId,
                contexts: [],
            };
        }
        const topK = input.topK && input.topK > 0 ? Math.min(input.topK, 10) : 5;
        const questionVector = await this.generateEmbedding(input.question);
        const contexts = await this.searchRelevantContexts(questionVector, topK);
        const contextText = contexts
            .map((ctx, index) => `[#${index + 1}] score=${ctx.score.toFixed(4)} source=${ctx.source}\n${ctx.text}`)
            .join("\n\n");
        const systemPrompt = this.buildSystemPrompt();
        const userPrompt = [
            "Lich su hoi thoai gan day (co the dung de nho ten, so thich cua nguoi dung):",
            chatHistory || "Chua co lich su.",
            "",
            "Cau hoi cua nguoi dung:",
            input.question,
            "",
            "Ngu canh truy xuat tu Qdrant (uu tien su dung truoc khi tra loi):",
            contextText || "Khong co ngu canh phu hop.",
        ].join("\n");
        const rawAnswer = await this.generateChatCompletion(systemPrompt, userPrompt);
        const parsed = this.parseModelResponse(rawAnswer);
        const resolvedResponse = await this.resolveToolResponse(parsed, input.question);
        const answer = this.pickAnswerText(resolvedResponse, rawAnswer);
        await this.appendConversationHistory(input.conversationId, [
            {
                role: "user",
                content: input.question,
                timestamp: new Date().toISOString(),
            },
            {
                role: "assistant",
                content: answer,
                timestamp: new Date().toISOString(),
            },
        ]);
        return {
            answer,
            type: resolvedResponse.type || "text",
            response: resolvedResponse,
            model: this.chatModel,
            conversationId: input.conversationId,
            contexts: contexts.map((ctx) => ({
                source: ctx.source,
                score: ctx.score,
                preview: ctx.text.slice(0, 220),
            })),
        };
    }
    async ensureKnowledgeBaseReady() {
        if (this.indexed)
            return;
        try {
            const existingCount = await this.countCollectionPoints();
            if (existingCount > 0) {
                this.indexed = true;
                console.log(`[RAG][CHAT] Skip guide indexing because collection already has ${existingCount} points.`);
                return;
            }
        }
        catch {
            // Fall back to guide indexing if count check is unavailable.
        }
        if (this.indexingPromise) {
            await this.indexingPromise;
            return;
        }
        this.indexingPromise = this.indexGuideIntoQdrant();
        try {
            await this.indexingPromise;
            this.indexed = true;
        }
        finally {
            this.indexingPromise = null;
        }
    }
    async indexGuideIntoQdrant() {
        const guidePath = path.resolve(process.cwd(), ChatbotService.GUIDE_FILENAME);
        try {
            this.guideContent = await readFile(guidePath, "utf8");
        }
        catch {
            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, `Cannot read ${ChatbotService.GUIDE_FILENAME}.`);
        }
        if (!this.guideContent.trim()) {
            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, `${ChatbotService.GUIDE_FILENAME} is empty.`);
        }
        if (this.qdrantInitializeSchema) {
            await this.ensureQdrantCollection();
        }
        const chunks = this.splitMarkdownIntoChunks(this.guideContent, 1400, 250);
        const points = [];
        for (let index = 0; index < chunks.length; index += 1) {
            const chunk = chunks[index];
            if (!chunk)
                continue;
            const vector = await this.generateEmbedding(chunk);
            points.push({
                id: index + 1,
                vector,
                payload: {
                    text: chunk,
                    source: ChatbotService.GUIDE_FILENAME,
                    index,
                },
            });
        }
        await this.upsertPoints(points);
        const indexedGuidePoints = await this.countCollectionPointsBySource(ChatbotService.GUIDE_FILENAME);
        console.log(`[RAG][CHAT] Guide indexing done. requestedUpsertPoints=${points.length}, verifiedGuidePoints=${indexedGuidePoints}`);
    }
    splitMarkdownIntoChunks(text, maxLen, overlap) {
        const compact = text.replace(/\r\n/g, "\n").trim();
        const paragraphs = compact
            .split(/\n{2,}/)
            .map((part) => part.trim())
            .filter(Boolean);
        const chunks = [];
        let current = "";
        for (const paragraph of paragraphs) {
            const next = current ? `${current}\n\n${paragraph}` : paragraph;
            if (next.length <= maxLen) {
                current = next;
                continue;
            }
            if (current) {
                chunks.push(current);
            }
            if (paragraph.length <= maxLen) {
                current = paragraph;
                continue;
            }
            let start = 0;
            while (start < paragraph.length) {
                const end = Math.min(start + maxLen, paragraph.length);
                chunks.push(paragraph.slice(start, end));
                if (end === paragraph.length)
                    break;
                start = Math.max(end - overlap, start + 1);
            }
            current = "";
        }
        if (current) {
            chunks.push(current);
        }
        return chunks;
    }
    buildSystemPrompt() {
        const maxPromptChars = 12000;
        const guideForPrompt = this.guideContent.length > maxPromptChars
            ? `${this.guideContent.slice(0, maxPromptChars)}\n\n[Guide content truncated for prompt length.]`
            : this.guideContent;
        return [
            "Ban la tro ly AI tu van khoa hoc cho du an e-learning.",
            "Hay dua vao tai lieu huong dan va ngu canh truy xuat de tra loi ngan gon, dung trong tam.",
            "Luon tra ve NOI DUNG DE DOC DUOC; khong de trong message.",
            "Neu tra ve JSON thi KHONG bao trong markdown code block.",
            "Neu khong du thong tin, hay noi ro phan thieu thay vi suy dien.",
            "Tai lieu huong dan he thong (AI_CHATBOT_GUIDE.md):",
            guideForPrompt,
        ].join("\n\n");
    }
    parseModelResponse(rawAnswer) {
        const trimmed = rawAnswer.trim();
        const clean = trimmed
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();
        try {
            const parsed = JSON.parse(clean);
            if (parsed && typeof parsed === "object") {
                return parsed;
            }
        }
        catch {
            // fallback to text structure
        }
        return {
            type: "text",
            message: clean || trimmed,
        };
    }
    pickAnswerText(parsed, rawAnswer) {
        if (typeof parsed.message === "string" && parsed.message.trim()) {
            return parsed.message.trim();
        }
        const compactRaw = rawAnswer
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();
        if (compactRaw)
            return compactRaw;
        return "Xin loi, hien tai toi chua tao duoc cau tra loi phu hop.";
    }
    async resolveToolResponse(parsed, userQuestion) {
        const toolCode = String(parsed.tool_code || "").trim();
        if (!toolCode)
            return parsed;
        if (toolCode === "searchCourses") {
            const parameters = parsed.parameters || {};
            const keyword = String(parameters.keyword || "").trim() || userQuestion;
            const category = String(parameters.category || "").trim();
            const level = String(parameters.level || "").trim();
            const price = String(parameters.price || "").trim().toLowerCase();
            const where = {
                isDestroyed: false,
                status: COURSE_STATUS.PUBLISHED,
            };
            if (keyword && keyword !== "all") {
                where.OR = [
                    { name: { contains: keyword, mode: "insensitive" } },
                    { lecturerName: { contains: keyword, mode: "insensitive" } },
                    { overview: { contains: keyword, mode: "insensitive" } },
                ];
            }
            if (category) {
                where.category = {
                    name: { contains: category, mode: "insensitive" },
                };
            }
            if (level) {
                where.level = { contains: level, mode: "insensitive" };
            }
            if (price === "free") {
                where.price = 0;
            }
            else if (price === "paid") {
                where.price = { gt: 0 };
            }
            const courses = await prisma.course.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    price: true,
                    level: true,
                    lecturerName: true,
                    category: { select: { name: true } },
                },
                orderBy: { createdAt: "desc" },
                take: 5,
            });
            if (!courses.length) {
                return {
                    type: "text",
                    message: "Hien tai he thong chua co khoa hoc phu hop de goi y. Ban co the thu lai sau hoac mo rong tieu chi tim kiem (linh vuc, cap do, ngan sach).",
                    courses: [],
                };
            }
            const lines = courses.map((course, index) => {
                const priceText = course.price > 0 ? `${course.price} VND` : "Mien phi";
                const levelText = course.level || "Khong xac dinh";
                const categoryText = course.category?.name || "Khac";
                return `${index + 1}. ${course.name} | ${priceText} | ${levelText} | ${categoryText}`;
            });
            return {
                type: "course_list",
                message: `Toi tim thay ${courses.length} khoa hoc phu hop:\n${lines.join("\n")}`,
                courses,
            };
        }
        return {
            type: "text",
            message: parsed.message || "Xin loi, hien tai toi chua ho tro lenh nay.",
        };
    }
    async tryDirectCourseConsulting(question) {
        const q = question.toLowerCase();
        const hasCourseIntent = q.includes("khoa hoc") ||
            q.includes("course") ||
            q.includes("tu van") ||
            q.includes("goi y");
        if (!hasCourseIntent)
            return null;
        const courses = await prisma.course.findMany({
            where: {
                isDestroyed: false,
                status: COURSE_STATUS.PUBLISHED,
            },
            select: {
                id: true,
                name: true,
                price: true,
                level: true,
                lecturerName: true,
                category: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 5,
        });
        if (!courses.length) {
            return {
                type: "text",
                message: "Hien tai chua co khoa hoc nao duoc dang tai. Khi co du lieu khoa hoc, toi se goi y ngay cho ban.",
                courses: [],
            };
        }
        const lines = courses.map((course, index) => {
            const priceText = course.price > 0 ? `${course.price} VND` : "Mien phi";
            const levelText = course.level || "Khong xac dinh";
            const categoryText = course.category?.name || "Khac";
            return `${index + 1}. ${course.name} | ${priceText} | ${levelText} | ${categoryText}`;
        });
        return {
            type: "course_list",
            message: `Toi tim thay ${courses.length} khoa hoc hien co:\n${lines.join("\n")}`,
            courses,
        };
    }
    async getConversationHistory(conversationId) {
        try {
            const key = this.buildConversationKey(conversationId);
            const redis = await this.getRedisClient();
            const rawItems = await redis.lRange(key, -20, -1);
            if (!rawItems.length)
                return "";
            return rawItems
                .map((item) => {
                try {
                    const parsed = JSON.parse(item);
                    return `${parsed.role.toUpperCase()}: ${parsed.content}`;
                }
                catch {
                    return "";
                }
            })
                .filter(Boolean)
                .join("\n");
        }
        catch (error) {
            throw this.wrapRedisError(error, "Failed to load conversation history from Redis.");
        }
    }
    async appendConversationHistory(conversationId, messages) {
        try {
            const key = this.buildConversationKey(conversationId);
            const redis = await this.getRedisClient();
            const pipeline = redis.multi();
            for (const message of messages) {
                pipeline.rPush(key, JSON.stringify(message));
            }
            pipeline.expire(key, this.memoryTtlSeconds);
            await pipeline.exec();
        }
        catch (error) {
            throw this.wrapRedisError(error, "Failed to save conversation history to Redis.");
        }
    }
    async getRedisClient() {
        if (!this.redisClient) {
            this.redisClient = createClient({
                socket: {
                    host: this.redisHost,
                    port: this.redisPort,
                },
            });
            this.redisClient.on("error", () => {
                // keep errors wrapped at call sites
            });
        }
        if (!this.redisClient.isOpen) {
            await this.redisClient.connect();
        }
        return this.redisClient;
    }
    buildConversationKey(conversationId) {
        return `chatbot:memory:${conversationId}`;
    }
    async ensureQdrantCollection() {
        try {
            await axios.put(`${this.qdrantUrl}/collections/${this.qdrantCollection}`, {
                vectors: {
                    size: this.embeddingDimensions,
                    distance: "Cosine",
                },
            }, {
                ...this.buildQdrantRequestConfig(15000),
            });
        }
        catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 409) {
                return;
            }
            throw this.wrapQdrantError(error, "Failed to initialize Qdrant schema.");
        }
    }
    async upsertPoints(points) {
        try {
            await axios.put(`${this.qdrantUrl}/collections/${this.qdrantCollection}/points?wait=true`, { points }, {
                ...this.buildQdrantRequestConfig(30000),
            });
        }
        catch (error) {
            throw this.wrapQdrantError(error, "Failed to store knowledge into Qdrant.");
        }
    }
    async searchRelevantContexts(vector, limit) {
        try {
            const response = await axios.post(`${this.qdrantUrl}/collections/${this.qdrantCollection}/points/search`, {
                vector,
                limit,
                with_payload: true,
            }, {
                ...this.buildQdrantRequestConfig(15000),
            });
            const points = response.data.result || [];
            const mapped = points
                .filter((item) => item.payload?.text)
                .map((item) => ({
                id: String(item.id),
                text: String(item.payload?.text),
                score: Number(item.score || 0),
                source: String(item.payload?.source || ChatbotService.GUIDE_FILENAME),
            }));
            const uniqueByContent = new Map();
            for (const item of mapped) {
                const key = `${item.source}::${item.text}`;
                if (!uniqueByContent.has(key)) {
                    uniqueByContent.set(key, item);
                }
            }
            return Array.from(uniqueByContent.values()).slice(0, limit);
        }
        catch (error) {
            throw this.wrapQdrantError(error, "Failed to retrieve context from Qdrant.");
        }
    }
    async countCollectionPoints() {
        const response = await axios.post(`${this.qdrantUrl}/collections/${this.qdrantCollection}/points/count`, {
            exact: true,
        }, {
            ...this.buildQdrantRequestConfig(15000),
        });
        return Number(response.data?.result?.count || 0);
    }
    async countCollectionPointsBySource(source) {
        const response = await axios.post(`${this.qdrantUrl}/collections/${this.qdrantCollection}/points/count`, {
            exact: true,
            filter: {
                must: [
                    {
                        key: "source",
                        match: { value: source },
                    },
                ],
            },
        }, {
            ...this.buildQdrantRequestConfig(15000),
        });
        return Number(response.data?.result?.count || 0);
    }
    async generateEmbedding(text) {
        try {
            const response = await axios.post(`${this.geminiBaseUrl}${this.geminiEmbeddingPath}`, {
                model: this.embeddingModel,
                input: text,
                dimensions: this.embeddingDimensions,
            }, {
                headers: {
                    Authorization: `Bearer ${this.geminiApiKey}`,
                    "Content-Type": "application/json",
                },
                timeout: 30000,
            });
            const vector = response.data?.data?.[0]?.embedding;
            if (!Array.isArray(vector) || vector.length === 0) {
                throw new ApiError(StatusCodes.BAD_GATEWAY, "Gemini embedding response is empty.");
            }
            return vector;
        }
        catch (error) {
            throw this.wrapGeminiError(error, "Failed to generate embedding from Gemini.");
        }
    }
    async generateChatCompletion(systemPrompt, userPrompt) {
        try {
            const response = await axios.post(`${this.geminiBaseUrl}${this.geminiChatPath}`, {
                model: this.chatModel,
                messages: [
                    {
                        role: "system",
                        content: systemPrompt,
                    },
                    {
                        role: "user",
                        content: userPrompt,
                    },
                ],
                temperature: 0.3,
            }, {
                headers: {
                    Authorization: `Bearer ${this.geminiApiKey}`,
                    "Content-Type": "application/json",
                },
                timeout: 30000,
            });
            const answer = response.data?.choices?.[0]?.message?.content?.trim();
            if (!answer) {
                throw new ApiError(StatusCodes.BAD_GATEWAY, "Gemini chat response is empty.");
            }
            return answer;
        }
        catch (error) {
            throw this.wrapGeminiError(error, "Failed to get chat completion from Gemini.");
        }
    }
    buildQdrantRequestConfig(timeout) {
        const config = {
            timeout,
        };
        if (this.qdrantApiKey) {
            config.headers = {
                "api-key": this.qdrantApiKey,
            };
        }
        return config;
    }
    wrapQdrantError(error, fallbackMessage) {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const detail = typeof error.response?.data === "string"
                ? error.response.data
                : JSON.stringify(error.response?.data || {});
            return new ApiError(StatusCodes.SERVICE_UNAVAILABLE, `${fallbackMessage} Qdrant status=${status || "unknown"}. ${detail}`);
        }
        if (error instanceof ApiError)
            return error;
        return new ApiError(StatusCodes.SERVICE_UNAVAILABLE, fallbackMessage);
    }
    wrapGeminiError(error, fallbackMessage) {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const detail = typeof error.response?.data === "string"
                ? error.response.data
                : JSON.stringify(error.response?.data || {});
            return new ApiError(StatusCodes.BAD_GATEWAY, `${fallbackMessage} Gemini status=${status || "unknown"}. ${detail}`);
        }
        if (error instanceof ApiError)
            return error;
        return new ApiError(StatusCodes.BAD_GATEWAY, fallbackMessage);
    }
    wrapRedisError(error, fallbackMessage) {
        if (error instanceof ApiError)
            return error;
        if (error instanceof Error) {
            return new ApiError(StatusCodes.SERVICE_UNAVAILABLE, `${fallbackMessage} Redis error: ${error.message}`);
        }
        return new ApiError(StatusCodes.SERVICE_UNAVAILABLE, fallbackMessage);
    }
}
export const chatbotService = new ChatbotService();
//# sourceMappingURL=chatbotService.js.map