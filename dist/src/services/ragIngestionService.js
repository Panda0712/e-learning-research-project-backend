import { env } from "@/configs/environment.js";
import { prisma } from "@/lib/prisma.js";
import { COURSE_STATUS } from "@/utils/constants.js";
import axios from "axios";
import { readFile } from "node:fs/promises";
import path from "node:path";
class RagIngestionService {
    static GUIDE_FILENAME = "AI_CHATBOT_GUIDE.md";
    qdrantHost = env.QDRANT_HOST || "localhost";
    qdrantPort = Number(env.QDRANT_PORT || 6334);
    qdrantUseTls = String(env.QDRANT_USE_TLS || "false") === "true";
    qdrantApiKey = env.QDRANT_API_KEY;
    qdrantCollection = env.QDRANT_COLLECTION_NAME || "vector_store";
    embeddingDimensions = Number(env.GEMINI_EMBEDDING_DIMENSIONS || 768);
    embeddingModel = env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";
    geminiApiKey = env.GEMINI_API_KEY || env.GEMINI_KEY;
    geminiBaseUrl = env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com";
    geminiEmbeddingPath = env.GEMINI_EMBEDDINGS_PATH || "/v1beta/openai/embeddings";
    startupIngestEnabled = String(process.env.CHATBOT_RAG_STARTUP_INGEST || "true") === "true";
    startupForceReindex = String(process.env.CHATBOT_RAG_FORCE_REINDEX || "false") === "true";
    qdrantInitializeSchema = String(env.QDRANT_INITIALIZE_SCHEMA || "true") === "true";
    qdrantUpsertBatchSize = Math.max(1, Number(process.env.CHATBOT_RAG_QDRANT_BATCH_SIZE || 64));
    lastReport = null;
    runningPromise = null;
    get qdrantUrl() {
        const protocol = this.qdrantUseTls ? "https" : "http";
        return `${protocol}://${this.qdrantHost}:${this.qdrantPort}`;
    }
    getStatus() {
        return {
            running: this.runningPromise !== null,
            startupIngestEnabled: this.startupIngestEnabled,
            startupForceReindex: this.startupForceReindex,
            lastReport: this.lastReport,
        };
    }
    async runIngestion(options) {
        if (this.runningPromise) {
            return this.runningPromise;
        }
        this.runningPromise = this.executeIngestion(options?.forceReindex ?? false);
        try {
            const report = await this.runningPromise;
            this.lastReport = report;
            return report;
        }
        finally {
            this.runningPromise = null;
        }
    }
    async runStartupIngestion() {
        if (!this.startupIngestEnabled) {
            const report = {
                runId: `rag-${Date.now()}`,
                status: "skipped",
                startedAt: new Date().toISOString(),
                finishedAt: new Date().toISOString(),
                durationMs: 0,
                collection: this.qdrantCollection,
                forceReindex: false,
                message: "Startup ingestion disabled by CHATBOT_RAG_STARTUP_INGEST.",
                totalDocuments: 0,
                totalChunks: 0,
                totalEmbeddedSuccess: 0,
                totalEmbeddedFailed: 0,
                requestedUpsertPoints: 0,
                verifiedIndexedByRunId: 0,
                collectionPointCount: 0,
                sections: [],
            };
            this.lastReport = report;
            console.log(`[RAG][INGEST][SKIPPED] ${report.message}`);
            return report;
        }
        return this.runIngestion({ forceReindex: this.startupForceReindex });
    }
    async executeIngestion(forceReindex) {
        const startedDate = new Date();
        const runId = `rag-${startedDate.getTime()}`;
        const report = {
            runId,
            status: "running",
            startedAt: startedDate.toISOString(),
            collection: this.qdrantCollection,
            forceReindex,
            message: "RAG ingestion is running.",
            totalDocuments: 0,
            totalChunks: 0,
            totalEmbeddedSuccess: 0,
            totalEmbeddedFailed: 0,
            requestedUpsertPoints: 0,
            verifiedIndexedByRunId: 0,
            collectionPointCount: 0,
            sections: [],
        };
        console.log(`[RAG][INGEST][START] runId=${runId} collection=${this.qdrantCollection} forceReindex=${forceReindex}`);
        try {
            if (!this.geminiApiKey) {
                throw new Error("Missing Gemini API key for embedding generation.");
            }
            if (this.qdrantInitializeSchema) {
                if (forceReindex) {
                    await this.deleteQdrantCollectionIfExists();
                }
                await this.ensureQdrantCollection();
            }
            if (!forceReindex) {
                const existingCount = await this.countCollectionPoints();
                if (existingCount > 0) {
                    const finishedDate = new Date();
                    const skippedReport = {
                        ...report,
                        status: "skipped",
                        finishedAt: finishedDate.toISOString(),
                        durationMs: finishedDate.getTime() - startedDate.getTime(),
                        message: `Skip ingestion because collection already has ${existingCount} points. Set CHATBOT_RAG_FORCE_REINDEX=true to force reindex.`,
                        collectionPointCount: existingCount,
                    };
                    console.log(`[RAG][INGEST][SKIPPED] ${skippedReport.message}`);
                    return skippedReport;
                }
            }
            const guideDocs = await this.buildGuideDocuments();
            const courseDocs = await this.buildCourseDocuments();
            const lecturerDocs = await this.buildLecturerDocuments();
            const categoryDocs = await this.buildCategoryDocuments();
            const allDocs = [...guideDocs, ...courseDocs, ...lecturerDocs, ...categoryDocs];
            report.totalDocuments = allDocs.length;
            const sectionBucket = new Map();
            const getSection = (sourceType, source) => {
                const current = sectionBucket.get(sourceType);
                if (current) {
                    return current;
                }
                const next = {
                    sourceType,
                    source,
                    documents: 0,
                    chunks: 0,
                    embeddedSuccess: 0,
                    embeddedFailed: 0,
                };
                sectionBucket.set(sourceType, next);
                return next;
            };
            const points = [];
            let nextPointId = 1;
            for (const doc of allDocs) {
                const section = getSection(doc.sourceType, doc.source);
                section.documents += 1;
                const chunks = this.splitTextIntoChunks(doc.text, 1000, 200);
                section.chunks += chunks.length;
                report.totalChunks += chunks.length;
                for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
                    const chunk = chunks[chunkIndex];
                    if (!chunk)
                        continue;
                    try {
                        const vector = await this.generateEmbedding(chunk);
                        points.push({
                            id: nextPointId,
                            vector,
                            payload: {
                                text: chunk,
                                source: doc.source,
                                index: chunkIndex,
                                runId,
                                sourceType: doc.sourceType,
                                sourceId: doc.sourceId,
                            },
                        });
                        nextPointId += 1;
                        section.embeddedSuccess += 1;
                        report.totalEmbeddedSuccess += 1;
                    }
                    catch (error) {
                        section.embeddedFailed += 1;
                        report.totalEmbeddedFailed += 1;
                        const reason = error instanceof Error ? error.message : "unknown";
                        console.error(`[RAG][INGEST][EMBED_FAIL] runId=${runId} sourceType=${doc.sourceType} sourceId=${doc.sourceId} chunkIndex=${chunkIndex} error=${reason}`);
                    }
                }
            }
            report.sections = Array.from(sectionBucket.values());
            if (points.length > 0) {
                await this.upsertPointsInBatches(points, runId);
            }
            report.requestedUpsertPoints = points.length;
            report.verifiedIndexedByRunId = await this.countCollectionPointsByRunId(runId);
            report.collectionPointCount = await this.countCollectionPoints();
            const finishedDate = new Date();
            const succeededReport = {
                ...report,
                status: "succeeded",
                finishedAt: finishedDate.toISOString(),
                durationMs: finishedDate.getTime() - startedDate.getTime(),
                message: `Ingestion completed. requestedUpsertPoints=${report.requestedUpsertPoints}, verifiedIndexedByRunId=${report.verifiedIndexedByRunId}, collectionPointCount=${report.collectionPointCount}`,
            };
            console.log(`[RAG][INGEST][DONE] runId=${runId} requestedUpsertPoints=${succeededReport.requestedUpsertPoints} verifiedIndexedByRunId=${succeededReport.verifiedIndexedByRunId} collectionPointCount=${succeededReport.collectionPointCount} durationMs=${succeededReport.durationMs}`);
            for (const section of succeededReport.sections) {
                console.log(`[RAG][INGEST][SECTION] runId=${runId} sourceType=${section.sourceType} documents=${section.documents} chunks=${section.chunks} embeddedSuccess=${section.embeddedSuccess} embeddedFailed=${section.embeddedFailed}`);
            }
            return succeededReport;
        }
        catch (error) {
            const finishedDate = new Date();
            const reason = error instanceof Error ? error.message : "Unknown ingestion error";
            const failedReport = {
                ...report,
                status: "failed",
                finishedAt: finishedDate.toISOString(),
                durationMs: finishedDate.getTime() - startedDate.getTime(),
                message: "RAG ingestion failed.",
                error: reason,
            };
            console.error(`[RAG][INGEST][FAILED] runId=${runId} error=${reason}`);
            return failedReport;
        }
    }
    async buildGuideDocuments() {
        const guidePath = path.resolve(process.cwd(), RagIngestionService.GUIDE_FILENAME);
        const content = await readFile(guidePath, "utf8");
        if (!content.trim()) {
            return [];
        }
        return [
            {
                source: RagIngestionService.GUIDE_FILENAME,
                sourceType: "guide",
                sourceId: "guide:ai-chatbot-guide",
                text: content,
            },
        ];
    }
    async buildCourseDocuments() {
        const courses = await prisma.course.findMany({
            where: {
                isDestroyed: false,
                status: COURSE_STATUS.PUBLISHED,
            },
            include: {
                category: { select: { id: true, name: true } },
                lecturer: { select: { firstName: true, lastName: true } },
                thumbnail: { select: { fileUrl: true } },
                reviews: { select: { rating: true } },
            },
            orderBy: { totalStudents: "desc" },
            take: 200,
        });
        return courses.map((course) => {
            const avgRating = course.reviews.length > 0
                ? (course.reviews.reduce((sum, item) => sum + item.rating, 0) /
                    course.reviews.length).toFixed(2)
                : "N/A";
            const text = [
                `Khóa học: ${course.name}`,
                `ID: ${course.id}`,
                `Danh mục: ${course.category?.name || "Chưa phân loại"}`,
                `Giảng viên: ${course.lecturerName || `${course.lecturer?.firstName || ""} ${course.lecturer?.lastName || ""}`.trim() || "Chưa cập nhật"}`,
                `Mức độ: ${course.level || "Chưa cập nhật"}`,
                `Giá: ${course.price}`,
                `Số học viên: ${course.totalStudents}`,
                `Số bài học: ${course.totalLessons}`,
                `Số bài quiz: ${course.totalQuizzes}`,
                `Đánh giá trung bình: ${avgRating}`,
                `Mô tả: ${course.overview || "Không có"}`,
                `Thumbnail: ${course.thumbnail?.fileUrl || "Không có"}`,
            ].join("\n");
            return {
                source: "db:course",
                sourceType: "course",
                sourceId: `course:${course.id}`,
                text,
            };
        });
    }
    async buildLecturerDocuments() {
        const lecturers = await prisma.user.findMany({
            where: { isDestroyed: false, role: "lecturer" },
            include: {
                lecturerProfile: {
                    select: {
                        professionalTitle: true,
                        bio: true,
                        totalStudents: true,
                        totalCourses: true,
                        avgRating: true,
                    },
                },
            },
            take: 200,
        });
        return lecturers.map((lecturer) => {
            const fullName = `${lecturer.firstName || ""} ${lecturer.lastName || ""}`.trim();
            const profile = lecturer.lecturerProfile;
            const text = [
                `Giảng viên: ${fullName || "Chưa cập nhật"}`,
                `ID: ${lecturer.id}`,
                `Email: ${lecturer.email}`,
                `Chức danh: ${profile?.professionalTitle || "Chưa cập nhật"}`,
                `Tổng học viên: ${profile?.totalStudents ?? 0}`,
                `Tổng khóa học: ${profile?.totalCourses ?? 0}`,
                `Đánh giá trung bình: ${profile?.avgRating ?? "N/A"}`,
                `Giới thiệu: ${profile?.bio || "Không có"}`,
            ].join("\n");
            return {
                source: "db:lecturer",
                sourceType: "lecturer",
                sourceId: `lecturer:${lecturer.id}`,
                text,
            };
        });
    }
    async buildCategoryDocuments() {
        const categories = await prisma.courseCategory.findMany({
            where: { isDestroyed: false },
            include: {
                _count: {
                    select: {
                        courses: {
                            where: {
                                isDestroyed: false,
                                status: COURSE_STATUS.PUBLISHED,
                            },
                        },
                    },
                },
            },
            orderBy: { name: "asc" },
        });
        return categories.map((category) => ({
            source: "db:category",
            sourceType: "category",
            sourceId: `category:${category.id}`,
            text: [
                `Danh mục: ${category.name}`,
                `ID: ${category.id}`,
                `Slug: ${category.slug}`,
                `Số khóa học đã publish: ${category._count.courses}`,
            ].join("\n"),
        }));
    }
    splitTextIntoChunks(text, maxLen, overlap) {
        const normalized = text.replace(/\r\n/g, "\n").trim();
        if (!normalized) {
            return [];
        }
        if (normalized.length <= maxLen) {
            return [normalized];
        }
        const paragraphs = normalized
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
    async generateEmbedding(text) {
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
            throw new Error("Empty embedding response from Gemini.");
        }
        return vector;
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
            throw this.wrapQdrantError(error, "Failed to initialize Qdrant collection.");
        }
    }
    async deleteQdrantCollectionIfExists() {
        try {
            await axios.delete(`${this.qdrantUrl}/collections/${this.qdrantCollection}`, {
                ...this.buildQdrantRequestConfig(15000),
            });
            console.log(`[RAG][INGEST] Deleted existing collection ${this.qdrantCollection}`);
        }
        catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return;
            }
            throw this.wrapQdrantError(error, "Failed to delete existing Qdrant collection.");
        }
    }
    async upsertPointsInBatches(points, runId) {
        for (let start = 0; start < points.length; start += this.qdrantUpsertBatchSize) {
            const batch = points.slice(start, start + this.qdrantUpsertBatchSize);
            await axios.put(`${this.qdrantUrl}/collections/${this.qdrantCollection}/points?wait=true`, { points: batch }, {
                ...this.buildQdrantRequestConfig(30000),
            });
            const end = start + batch.length;
            console.log(`[RAG][INGEST][UPSERT] runId=${runId} batchSize=${batch.length} progress=${end}/${points.length}`);
        }
    }
    async countCollectionPointsByRunId(runId) {
        const response = await axios.post(`${this.qdrantUrl}/collections/${this.qdrantCollection}/points/count`, {
            exact: true,
            filter: {
                must: [
                    {
                        key: "runId",
                        match: { value: runId },
                    },
                ],
            },
        }, {
            ...this.buildQdrantRequestConfig(15000),
        });
        return Number(response.data?.result?.count || 0);
    }
    async countCollectionPoints() {
        const response = await axios.post(`${this.qdrantUrl}/collections/${this.qdrantCollection}/points/count`, {
            exact: true,
        }, {
            ...this.buildQdrantRequestConfig(15000),
        });
        return Number(response.data?.result?.count || 0);
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
            return new Error(`${fallbackMessage} Qdrant status=${status || "unknown"}. ${detail}`);
        }
        if (error instanceof Error) {
            return error;
        }
        return new Error(fallbackMessage);
    }
}
export const ragIngestionService = new RagIngestionService();
//# sourceMappingURL=ragIngestionService.js.map