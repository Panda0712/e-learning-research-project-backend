# 🤖 HƯỚNG DẪN XÂY DỰNG AI CHATBOT TƯ VẤN KHÓA HỌC (Node.js + LangChain)

> **Tham khảo từ:** Java Spring AI chatbot trong dự án Movie Ticket Booking Service  
> **Áp dụng cho:** E-Learning Research Project Backend (Node.js + Prisma + MySQL)

---

## 📌 TỔNG QUAN KIẾN TRÚC

Chatbot này được thiết kế theo mô hình **RAG (Retrieval-Augmented Generation)** kết hợp **Function Calling**, giống y hệt luồng Java Spring AI nhưng được viết lại bằng Node.js + LangChain:

```
┌─────────────────────────────────────────────────────────────────┐
│                    KIẾN TRÚC TỔNG THỂ                           │
└─────────────────────────────────────────────────────────────────┘

Các thành phần:
  ┌────────────────┐     ┌──────────────────┐     ┌────────────────┐
  │   LLM          │     │  Vector Store    │     │  Chat Memory   │
  │ Gemini 2.5     │     │ Qdrant (port     │     │ Redis (lịch sử │
  │ Flash (qua     │     │ 6334) - lưu      │     │ hội thoại,     │
  │ OpenAI API)    │     │ embeddings khóa  │     │ TTL 30 ngày)   │
  └────────────────┘     │ học, lecturer,   │     └────────────────┘
                         │ category...      │
                         └──────────────────┘

  ┌──────────────────────────────────────────────────────────────┐
  │                    LUỒNG XỬ LÝ RUNTIME                       │
  │                                                              │
  │  User Message                                                │
  │      ↓                                                       │
  │  ChatbotController (POST /chatbot/chat)                      │
  │      ↓                                                       │
  │  RagFilterBuilder (phân tích message → filter expression)    │
  │      ↓                                                       │
  │  ChatbotService.getChatResponse()                            │
  │      ├──▶ Redis: load lịch sử hội thoại                     │
  │      ├──▶ Qdrant: semantic search (top 10, threshold 0.50)   │
  │      ├──▶ Function Calling Tools (nếu cần):                  │
  │      │       • searchCourses(keyword, category, level, price) │
  │      │       • getCourseDetail(courseId)                      │
  │      │       • getCourseReviews(courseId)                     │
  │      │       • getEnrollmentInfo(studentId, courseId)         │
  │      └──▶ Gemini LLM → ChatResponse (JSON)                   │
  │      ↓                                                       │
  │  Redis: save lịch sử                                         │
  │      ↓                                                       │
  │  Return ChatResponse                                         │
  └──────────────────────────────────────────────────────────────┘
```

---

## 🏗️ CẤU TRÚC THƯ MỤC

Tạo module chatbot trong project e-learning backend hiện tại:

```
src/
├── chatbot/                          ← Module chatbot MỚI
│   ├── config/
│   │   └── aiConfig.ts               ← Cấu hình LLM, VectorStore, Memory
│   ├── components/
│   │   ├── ragDataLoader.ts          ← Nạp dữ liệu vào Qdrant khi startup
│   │   ├── ragDocumentMapper.ts      ← Entity → LangChain Document
│   │   └── redisChatMemory.ts        ← Lưu/đọc lịch sử chat từ Redis
│   ├── services/
│   │   ├── chatbotService.ts         ← Business logic xử lý chat
│   │   ├── ragIngestionService.ts    ← Nạp dữ liệu từ DB → VectorStore
│   │   └── chatSystemPrompt.ts       ← System prompt định nghĩa AI
│   ├── tools/
│   │   ├── courseTool.ts             ← Function calling tools khóa học
│   │   └── ragFilterBuilder.ts       ← Phân tích message → RAG filter
│   ├── controllers/
│   │   └── chatbotController.ts      ← REST endpoint POST /chatbot/chat
│   └── routes/
│       └── chatbotRoute.ts           ← Express route
```

---

## 📦 CÀI ĐẶT DEPENDENCIES

Thêm vào `package.json` của project e-learning:

```bash
npm install @langchain/core @langchain/openai langchain \
            @langchain/qdrant @langchain/community \
            ioredis uuid zod
```

**Giải thích từng package:**

| Package | Vai trò | Tương đương Java |
|---------|---------|-----------------|
| `@langchain/core` | Core LangChain (chain, memory, tool) | Spring AI Core |
| `@langchain/openai` | OpenAI-compatible client (dùng cho Gemini) | `spring-ai-openai-spring-boot-starter` |
| `@langchain/qdrant` | Qdrant Vector Store | `spring-ai-qdrant-store-spring-boot-starter` |
| `langchain` | Utilities (text splitter, etc.) | Spring AI Transformers |
| `ioredis` | Redis client (đã có trong project) | Spring Data Redis |
| `zod` | Schema validation cho tool parameters | Spring AI ToolParam |

---

## ⚙️ BIẾN MÔI TRƯỜNG (.env)

Thêm vào file `.env` hiện có:

```env
# AI / LLM
GEMINI_KEY=your_gemini_api_key_here

# Qdrant Vector DB
QDRANT_HOST=localhost
QDRANT_PORT=6334
QDRANT_COLLECTION=elearning_vector_store

# Redis (đã có trong project, dùng lại)
REDIS_HOST=localhost
REDIS_PORT=6379

# E-Learning Backend API (cho function calling gọi nội bộ)
ELEARNING_API_BASE_URL=http://localhost:3000/api/v1
```

---

## 🔧 PHASE 1: CẤU HÌNH AI (aiConfig.ts)

**Tương đương:** `AiConfig.java` trong project Java

```typescript
// src/chatbot/config/aiConfig.ts
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { BufferWindowMemory } from "langchain/memory";
import { RedisChatMessageHistory } from "@langchain/community/stores/message/ioredis";
import Redis from "ioredis";

// ────────────────────────────────────────────────
// 1. LLM - Gemini 2.5 Flash qua OpenAI-compatible API
//    (Giống: spring.ai.openai.chat.options.model=gemini-2.5-flash)
// ────────────────────────────────────────────────
export const createChatModel = () =>
  new ChatOpenAI({
    modelName: "gemini-2.5-flash",
    openAIApiKey: process.env.GEMINI_KEY!,
    configuration: {
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
    },
    temperature: 0.3,
  });

// ────────────────────────────────────────────────
// 2. Embedding Model
//    (Giống: spring.ai.openai.embedding.options.model=gemini-embedding-001)
// ────────────────────────────────────────────────
export const createEmbeddingModel = () =>
  new OpenAIEmbeddings({
    modelName: "gemini-embedding-001",
    openAIApiKey: process.env.GEMINI_KEY!,
    configuration: {
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
    },
    dimensions: 768,
  });

// ────────────────────────────────────────────────
// 3. Qdrant Vector Store
//    (Giống: spring.ai.vectorstore.qdrant.host=localhost)
// ────────────────────────────────────────────────
export const createVectorStore = async () => {
  const embeddings = createEmbeddingModel();
  return await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: `http://${process.env.QDRANT_HOST || "localhost"}:${process.env.QDRANT_PORT || 6334}`,
    collectionName: process.env.QDRANT_COLLECTION || "elearning_vector_store",
  });
};

// ────────────────────────────────────────────────
// 4. Redis Chat Memory Factory
//    (Giống: RedisChatMemoryRepository.java + MessageWindowChatMemory maxMessages=30)
// ────────────────────────────────────────────────
export const createChatMemory = (conversationId: string) => {
  const redisClient = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
  });

  return new BufferWindowMemory({
    chatHistory: new RedisChatMessageHistory({
      sessionId: `chat:memory:${conversationId}`, // Key format giống Java: "chat:memory:{conversationId}"
      client: redisClient,
      ttl: 30 * 24 * 60 * 60, // TTL 30 ngày, giống Java
    }),
    k: 30, // Lưu 30 tin nhắn gần nhất, giống Java maxMessages=30
    returnMessages: true,
    memoryKey: "chat_history",
  });
};
```

---

## 📄 PHASE 2: DOCUMENT MAPPER (ragDocumentMapper.ts)

**Tương đương:** `RagDocumentMapper.java`

Ánh xạ dữ liệu từ Prisma entities sang LangChain Documents để lưu vào Qdrant:

```typescript
// src/chatbot/components/ragDocumentMapper.ts
import { Document } from "@langchain/core/documents";

// ── Kiểu dữ liệu Course từ Prisma (với relations) ──
interface CourseWithRelations {
  id: number;
  name: string;
  lecturerName: string | null;
  overview: string | null;
  level: string | null;
  duration: string | null;
  price: number;
  totalStudents: number;
  totalLessons: number;
  totalQuizzes: number;
  status: string;
  category?: { id: number; name: string } | null;
  lecturer?: { firstName: string | null; lastName: string | null } | null;
  thumbnail?: { fileUrl: string } | null;
  reviews?: { rating: number }[];
}

interface LecturerWithProfile {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  lecturerProfile?: {
    professionalTitle: string | null;
    bio: string | null;
    totalStudents: number | null;
    totalCourses: number | null;
    avgRating: number | null;
  } | null;
}

interface CourseCategoryData {
  id: number;
  name: string;
  slug: string;
}

// ────────────────────────────────────────────────────────────────
// fromCourse: Chuyển Course Entity → LangChain Document
// Tương đương fromMovie() trong Java RagDocumentMapper
// ────────────────────────────────────────────────────────────────
export function fromCourse(course: CourseWithRelations): Document {
  const avgRating =
    course.reviews && course.reviews.length > 0
      ? (
          course.reviews.reduce((s, r) => s + r.rating, 0) /
          course.reviews.length
        ).toFixed(1)
      : "Chưa có";

  const content = `
Khóa học: ${course.name}
Giảng viên: ${course.lecturerName || "Chưa cập nhật"}
Danh mục: ${course.category?.name || "Chưa phân loại"}
Cấp độ: ${course.level || "Mọi cấp độ"}
Thời lượng: ${course.duration || "Chưa cập nhật"}
Giá: ${course.price === 0 ? "Miễn phí" : `${course.price.toLocaleString("vi-VN")} VNĐ`}
Số học viên: ${course.totalStudents}
Số bài học: ${course.totalLessons}
Số bài quiz: ${course.totalQuizzes}
Đánh giá trung bình: ${avgRating}/5
Trạng thái: ${course.status}
Mô tả: ${course.overview || "Chưa có mô tả"}
  `.trim();

  const metadata: Record<string, unknown> = {
    type: "course",
    source: "db:course",
    id: `course/${course.id}`,
    courseId: course.id,
    categoryId: course.category?.id ?? null,
    categoryName: course.category?.name ?? null,
    level: course.level ?? null,
    price: course.price,
    status: course.status,        // draft | pending | published | rejected
    totalStudents: course.totalStudents,
    thumbnailUrl: course.thumbnail?.fileUrl ?? null,
  };

  return new Document({ pageContent: content, metadata });
}

// ────────────────────────────────────────────────────────────────
// fromLecturer: Chuyển Lecturer Profile → Document
// Tương đương fromCinema() trong Java
// ────────────────────────────────────────────────────────────────
export function fromLecturer(lecturer: LecturerWithProfile): Document {
  const fullName =
    `${lecturer.firstName || ""} ${lecturer.lastName || ""}`.trim() ||
    "Chưa cập nhật";
  const profile = lecturer.lecturerProfile;

  const content = `
Giảng viên: ${fullName}
Email: ${lecturer.email}
Chức danh: ${profile?.professionalTitle || "Chưa cập nhật"}
Tổng số học viên: ${profile?.totalStudents ?? 0}
Tổng số khóa học: ${profile?.totalCourses ?? 0}
Đánh giá trung bình: ${profile?.avgRating ? `${profile.avgRating}/5` : "Chưa có"}
Giới thiệu: ${profile?.bio || "Chưa có thông tin"}
  `.trim();

  const metadata: Record<string, unknown> = {
    type: "lecturer",
    source: "db:lecturer",
    id: `lecturer/${lecturer.id}`,
    lecturerId: lecturer.id,
    totalCourses: profile?.totalCourses ?? 0,
    avgRating: profile?.avgRating ?? null,
  };

  return new Document({ pageContent: content, metadata });
}

// ────────────────────────────────────────────────────────────────
// fromCategory: Chuyển CourseCategory → Document
// Tương đương fromScreenRoomType() trong Java
// ────────────────────────────────────────────────────────────────
export function fromCategory(category: CourseCategoryData): Document {
  const content = `
Danh mục khóa học: ${category.name}
Slug: ${category.slug}
  `.trim();

  const metadata: Record<string, unknown> = {
    type: "category",
    source: "db:category",
    id: `category/${category.id}`,
    categoryId: category.id,
    slug: category.slug,
  };

  return new Document({ pageContent: content, metadata });
}
```

---

## 📥 PHASE 3: RAG INGESTION SERVICE (ragIngestionService.ts)

**Tương đương:** `RagIngestionService.java` + `RagDataLoader.java`

```typescript
// src/chatbot/services/ragIngestionService.ts
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { QdrantVectorStore } from "@langchain/qdrant";
import { prisma } from "@/lib/prisma.js";
import { fromCourse, fromLecturer, fromCategory } from "../components/ragDocumentMapper.js";

// Text splitter tương đương TokenTextSplitter trong Java
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 50,
});

// ──────────────────────────────────────────────────────────────
// ingestAll: Nạp toàn bộ dữ liệu vào Qdrant
// Tương đương RagIngestionService.ingestAll() + RagDataLoader.run()
// ──────────────────────────────────────────────────────────────
export async function ingestAll(vectorStore: QdrantVectorStore): Promise<number> {
  let count = 0;

  // 1. Xóa dữ liệu cũ (tương đương vectorStore.delete(filter) trong Java)
  try {
    await vectorStore.client.deleteCollection(
      process.env.QDRANT_COLLECTION || "elearning_vector_store"
    );
    console.log("✅ Đã xóa collection cũ");
  } catch {
    console.log("ℹ️ Collection chưa tồn tại, sẽ tạo mới");
  }

  // 2. Nạp Khóa học (top 200 khóa đã published, tương đương findTop100ByOrderByEndDateDesc)
  count += await ingestCourses(vectorStore);

  // 3. Nạp Giảng viên
  count += await ingestLecturers(vectorStore);

  // 4. Nạp Danh mục
  count += await ingestCategories(vectorStore);

  return count;
}

async function ingestCourses(vectorStore: QdrantVectorStore): Promise<number> {
  const courses = await prisma.course.findMany({
    where: { isDestroyed: false, status: "published" },
    include: {
      category: { select: { id: true, name: true } },
      lecturer: { select: { firstName: true, lastName: true } },
      thumbnail: { select: { fileUrl: true } },
      reviews: { select: { rating: true } },
    },
    orderBy: { totalStudents: "desc" },
    take: 200,
  });

  const docs = [];
  for (const course of courses) {
    const doc = fromCourse(course);
    const chunks = await splitter.splitDocuments([doc]);
    docs.push(...chunks);
  }

  if (docs.length > 0) {
    await vectorStore.addDocuments(docs);
    console.log(`✅ Đã nạp ${docs.length} chunks khóa học`);
  }
  return docs.length;
}

async function ingestLecturers(vectorStore: QdrantVectorStore): Promise<number> {
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
  });

  const docs = [];
  for (const lecturer of lecturers) {
    const doc = fromLecturer(lecturer);
    const chunks = await splitter.splitDocuments([doc]);
    docs.push(...chunks);
  }

  if (docs.length > 0) {
    await vectorStore.addDocuments(docs);
    console.log(`✅ Đã nạp ${docs.length} chunks giảng viên`);
  }
  return docs.length;
}

async function ingestCategories(vectorStore: QdrantVectorStore): Promise<number> {
  const categories = await prisma.courseCategory.findMany({
    where: { isDestroyed: false },
  });

  const docs = categories.map(fromCategory);

  if (docs.length > 0) {
    await vectorStore.addDocuments(docs);
    console.log(`✅ Đã nạp ${docs.length} danh mục`);
  }
  return docs.length;
}
```

---

## 🔍 PHASE 4: RAG FILTER BUILDER (ragFilterBuilder.ts)

**Tương đương:** `RagFilterBuilder.java` - Phân tích câu hỏi để tạo Qdrant filter

```typescript
// src/chatbot/tools/ragFilterBuilder.ts

// Bỏ dấu tiếng Việt để matching từ khóa
function asciiLower(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ");
}

function containsAny(text: string, ...keys: string[]): boolean {
  return keys.some((k) => text.includes(k));
}

/**
 * Phân tích câu hỏi của user → Qdrant filter object
 * Tương đương RagFilterBuilder.buildFilterExpression() trong Java
 *
 * Qdrant filter format cho LangChain:
 * { must: [{ key: "metadata.type", match: { value: "course" } }] }
 */
export function buildFilterExpression(userMsg: string): object | undefined {
  const q = asciiLower(userMsg);
  const mustConditions: object[] = [];

  // --- Phát hiện loại dữ liệu cần tìm ---

  // Ưu tiên: tư vấn khóa học / tìm kiếm khóa học
  if (containsAny(q, "khoa hoc", "course", "hoc", "bai hoc", "lesson")) {
    mustConditions.push({ key: "metadata.type", match: { value: "course" } });
  }

  // Giảng viên / instructor
  if (containsAny(q, "giang vien", "instructor", "lecturer", "thay", "co")) {
    if (mustConditions.length === 0) {
      mustConditions.push({ key: "metadata.type", match: { value: "lecturer" } });
    }
  }

  // Danh mục / category
  if (containsAny(q, "danh muc", "the loai", "category", "linh vuc", "nganh")) {
    if (mustConditions.length === 0) {
      mustConditions.push({ key: "metadata.type", match: { value: "category" } });
    }
  }

  // --- Lọc theo cấp độ ---
  if (containsAny(q, "co ban", "beginner", "moi bat dau")) {
    mustConditions.push({ key: "metadata.level", match: { value: "Beginner" } });
  } else if (containsAny(q, "trung cap", "intermediate")) {
    mustConditions.push({ key: "metadata.level", match: { value: "Intermediate" } });
  } else if (containsAny(q, "nang cao", "advanced", "chuyen sau")) {
    mustConditions.push({ key: "metadata.level", match: { value: "Advanced" } });
  }

  // --- Lọc giá ---
  if (containsAny(q, "mien phi", "free", "khong mat tien")) {
    mustConditions.push({ key: "metadata.price", range: { lte: 0 } });
  }

  // --- Chỉ lấy khóa học đã published ---
  if (mustConditions.some((c: any) => c.key === "metadata.type" &&
      c.match?.value === "course")) {
    mustConditions.push({ key: "metadata.status", match: { value: "published" } });
  }

  if (mustConditions.length === 0) return undefined; // Không filter → tìm tất cả

  return { must: mustConditions };
}
```

---

## 🛠️ PHASE 5: FUNCTION CALLING TOOLS (courseTool.ts)

**Tương đương:** `ShowtimeTool.java` - Cho phép AI truy vấn DB trực tiếp

```typescript
// src/chatbot/tools/courseTool.ts
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { prisma } from "@/lib/prisma.js";

// ──────────────────────────────────────────────────────────────
// Tool 1: searchCourses
// Tương đương ShowtimeTool.searchShowtimes() trong Java
// AI tự động gọi khi user hỏi về danh sách khóa học
// ──────────────────────────────────────────────────────────────
export const searchCoursesTool = tool(
  async ({ keyword, categoryId, level, maxPrice, minPrice }) => {
    const where: any = {
      isDestroyed: false,
      status: "published",
    };

    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { lecturerName: { contains: keyword } },
        { overview: { contains: keyword } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (level) where.level = level;
    if (maxPrice !== undefined) where.price = { ...(where.price || {}), lte: maxPrice };
    if (minPrice !== undefined) where.price = { ...(where.price || {}), gte: minPrice };

    const courses = await prisma.course.findMany({
      where,
      include: {
        category: { select: { name: true } },
        thumbnail: { select: { fileUrl: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { totalStudents: "desc" },
      take: 10,
    });

    return JSON.stringify(
      courses.map((c) => ({
        id: c.id,
        name: c.name,
        lecturerName: c.lecturerName,
        category: c.category?.name,
        level: c.level,
        price: c.price,
        totalStudents: c.totalStudents,
        totalLessons: c.totalLessons,
        averageRating:
          c.reviews.length > 0
            ? (c.reviews.reduce((s, r) => s + r.rating, 0) / c.reviews.length).toFixed(1)
            : null,
        thumbnailUrl: c.thumbnail?.fileUrl,
        overview: c.overview?.substring(0, 200),
      }))
    );
  },
  {
    name: "searchCourses",
    description:
      "Tìm kiếm danh sách khóa học theo từ khóa, danh mục, cấp độ, giá. " +
      "Dùng khi user hỏi về khóa học nào đó, muốn tìm khóa học phù hợp, " +
      "hoặc muốn biết có những khóa học gì.",
    schema: z.object({
      keyword: z.string().optional().describe("Từ khóa tìm kiếm (tên khóa học, giảng viên, mô tả)"),
      categoryId: z.number().optional().describe("ID danh mục khóa học"),
      level: z.enum(["Beginner", "Intermediate", "Advanced"]).optional().describe("Cấp độ khóa học"),
      maxPrice: z.number().optional().describe("Giá tối đa (VNĐ). Dùng 0 cho khóa học miễn phí"),
      minPrice: z.number().optional().describe("Giá tối thiểu (VNĐ)"),
    }),
  }
);

// ──────────────────────────────────────────────────────────────
// Tool 2: getCourseDetail
// AI gọi khi user hỏi chi tiết về 1 khóa học cụ thể
// ──────────────────────────────────────────────────────────────
export const getCourseDetailTool = tool(
  async ({ courseId }) => {
    const course = await prisma.course.findUnique({
      where: { id: courseId, isDestroyed: false },
      include: {
        category: { select: { id: true, name: true } },
        thumbnail: { select: { fileUrl: true } },
        lecturer: { select: { firstName: true, lastName: true } },
        modules: {
          where: { isDestroyed: false },
          include: {
            lessons: { where: { isDestroyed: false }, select: { id: true, title: true, duration: true } },
          },
        },
        courseFAQs: { where: { isDestroyed: false }, select: { question: true, answer: true } },
      },
    });

    if (!course) return JSON.stringify({ error: "Không tìm thấy khóa học" });

    const reviews = await prisma.courseReview.findMany({
      where: { courseId, isDestroyed: false },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { studentName: true, rating: true, content: true },
    });

    return JSON.stringify({
      id: course.id,
      name: course.name,
      lecturerName: course.lecturerName,
      category: course.category?.name,
      level: course.level,
      price: course.price,
      duration: course.duration,
      totalStudents: course.totalStudents,
      totalLessons: course.totalLessons,
      overview: course.overview,
      thumbnailUrl: course.thumbnail?.fileUrl,
      modules: course.modules.map((m) => ({
        title: m.title,
        lessons: m.lessons.map((l) => ({ title: l.title, duration: l.duration })),
      })),
      faqs: course.courseFAQs,
      recentReviews: reviews,
    });
  },
  {
    name: "getCourseDetail",
    description:
      "Lấy thông tin chi tiết về một khóa học cụ thể bao gồm: nội dung, " +
      "danh sách module/bài học, FAQ, đánh giá gần đây. " +
      "Dùng khi user hỏi chi tiết về một khóa học.",
    schema: z.object({
      courseId: z.number().describe("ID của khóa học cần xem chi tiết"),
    }),
  }
);

// ──────────────────────────────────────────────────────────────
// Tool 3: getCourseReviews
// Lấy đánh giá của khóa học
// ──────────────────────────────────────────────────────────────
export const getCourseReviewsTool = tool(
  async ({ courseId }) => {
    const [reviews, stats] = await Promise.all([
      prisma.courseReview.findMany({
        where: { courseId, isDestroyed: false },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { studentName: true, rating: true, content: true, createdAt: true },
      }),
      prisma.courseReview.findMany({
        where: { courseId, isDestroyed: false },
        select: { rating: true },
      }),
    ]);

    const avgRating =
      stats.length > 0
        ? (stats.reduce((s, r) => s + r.rating, 0) / stats.length).toFixed(1)
        : 0;

    return JSON.stringify({
      courseId,
      totalReviews: stats.length,
      averageRating: avgRating,
      ratingDistribution: {
        5: stats.filter((r) => r.rating === 5).length,
        4: stats.filter((r) => r.rating === 4).length,
        3: stats.filter((r) => r.rating === 3).length,
        2: stats.filter((r) => r.rating === 2).length,
        1: stats.filter((r) => r.rating === 1).length,
      },
      recentReviews: reviews,
    });
  },
  {
    name: "getCourseReviews",
    description:
      "Lấy danh sách đánh giá và thống kê rating của một khóa học. " +
      "Dùng khi user hỏi về chất lượng, đánh giá của khóa học.",
    schema: z.object({
      courseId: z.number().describe("ID của khóa học"),
    }),
  }
);

// ──────────────────────────────────────────────────────────────
// Tool 4: getAllCategories
// Lấy danh sách tất cả danh mục
// ──────────────────────────────────────────────────────────────
export const getAllCategoriesTool = tool(
  async () => {
    const categories = await prisma.courseCategory.findMany({
      where: { isDestroyed: false },
      include: {
        _count: { select: { courses: { where: { status: "published", isDestroyed: false } } } },
      },
    });
    return JSON.stringify(
      categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        totalPublishedCourses: c._count.courses,
      }))
    );
  },
  {
    name: "getAllCategories",
    description:
      "Lấy danh sách tất cả danh mục/lĩnh vực khóa học đang có. " +
      "Dùng khi user hỏi có những danh mục gì, hoặc muốn biết các lĩnh vực đào tạo.",
    schema: z.object({}),
  }
);

// Export tất cả tools
export const courseTools = [
  searchCoursesTool,
  getCourseDetailTool,
  getCourseReviewsTool,
  getAllCategoriesTool,
];
```

---

## 💬 PHASE 6: SYSTEM PROMPT (chatSystemPrompt.ts)

**Tương đương:** `ChatSystemPrompt.java`

```typescript
// src/chatbot/services/chatSystemPrompt.ts

export function buildSystemPrompt(): string {
  const today = new Date().toISOString().split("T")[0]; // yyyy-MM-dd

  return `
Bạn là **ELearn Cbot**, chatbot hỗ trợ tư vấn khóa học thông minh và thân thiện của nền tảng E-Learning.

## MỤC TIÊU:
- Tư vấn người dùng chọn khóa học phù hợp với mục tiêu và trình độ
- Cung cấp thông tin chi tiết về khóa học, giảng viên, danh mục
- Hỗ trợ người dùng hiểu lộ trình học tập

## NGUỒN DỮ LIỆU:
- Bạn được cung cấp [CONTEXT] từ hệ thống RAG với dữ liệu về:
  - type: "course" | "lecturer" | "category"
  - Các metadata: courseId, categoryId, level, price, status, totalStudents...
- Hôm nay là: ${today}

## TOOLS CÓ SẴN:
1. **searchCourses**: Tìm kiếm khóa học theo keyword/category/level/price
2. **getCourseDetail**: Lấy chi tiết đầy đủ một khóa học (modules, FAQs, reviews)
3. **getCourseReviews**: Xem đánh giá và rating của khóa học
4. **getAllCategories**: Lấy danh sách tất cả danh mục

## QUY TẮC SỬ DỤNG TOOLS:
- Dùng **searchCourses** khi user hỏi "có khóa học nào về...", "tìm khóa...", "gợi ý khóa..."
- Dùng **getCourseDetail** khi user hỏi chi tiết về 1 khóa (cần có courseId)
- Dùng **getCourseReviews** khi user hỏi "đánh giá", "chất lượng", "rating"
- Dùng **getAllCategories** khi user hỏi "có những lĩnh vực gì", "danh mục nào"
- KHÔNG gọi tool nếu đã có đủ thông tin trong [CONTEXT] để trả lời

## QUY TẮC TƯ VẤN:
- Nếu user chưa nêu mục tiêu → Hỏi: trình độ hiện tại, lĩnh vực quan tâm, ngân sách
- Ưu tiên gợi ý khóa học có nhiều học viên và rating cao
- Luôn đề cập giá cả (miễn phí / có phí) trong tư vấn
- Gợi ý lộ trình học từ Beginner → Intermediate → Advanced nếu phù hợp

## ĐỊNH DẠNG TRẢ LỜI (BẮT BUỘC):
Luôn trả về JSON thuần theo schema sau (KHÔNG có markdown, KHÔNG có text bên ngoài JSON):

\`\`\`
{
  "type": "text | course_card | course_list | lecturer_card | category_list | error",
  "message": "Nội dung trả lời bằng tiếng Việt tự nhiên",
  "course": { CourseDto } | null,
  "courses": [ CourseDto ] | null,
  "lecturer": { LecturerDto } | null,
  "categories": [ CategoryDto ] | null
}
\`\`\`

### CourseDto:
\`\`\`json
{
  "id": <number>,
  "name": "<tên khóa học>",
  "lecturerName": "<tên giảng viên>",
  "category": "<danh mục>",
  "level": "<Beginner|Intermediate|Advanced>",
  "price": <number>,
  "priceDisplay": "<Miễn phí | X VNĐ>",
  "totalStudents": <number>,
  "totalLessons": <number>,
  "averageRating": <number | null>,
  "thumbnailUrl": "<url | null>",
  "overview": "<mô tả ngắn>"
}
\`\`\`

### Quy tắc type:
- "text": câu trả lời chung, hỏi thêm thông tin
- "course_card": thông tin 1 khóa học cụ thể
- "course_list": danh sách gợi ý nhiều khóa học
- "lecturer_card": thông tin giảng viên
- "category_list": danh sách danh mục
- "error": lỗi hoặc không tìm thấy thông tin

## LƯU Ý CUỐI:
- Trả lời bằng tiếng Việt tự nhiên, thân thiện
- KHÔNG bịa thông tin không có trong [CONTEXT] hoặc kết quả tool
- Nếu không đủ dữ liệu, hãy nói rõ và đề nghị user cung cấp thêm thông tin
  `.trim();
}
```

---

## 🧠 PHASE 7: CHATBOT SERVICE (chatbotService.ts)

**Tương đương:** `ChatBotService.java` - Business logic chính

```typescript
// src/chatbot/services/chatbotService.ts
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { createChatModel, createVectorStore, createChatMemory } from "../config/aiConfig.js";
import { buildFilterExpression } from "../tools/ragFilterBuilder.js";
import { courseTools } from "../tools/courseTool.js";
import { buildSystemPrompt } from "./chatSystemPrompt.js";

// Type cho ChatResponse (tương đương ChatResponse.java record)
export interface ChatResponse {
  type: string;
  message: string;
  course?: object | null;
  courses?: object[] | null;
  lecturer?: object | null;
  categories?: object[] | null;
}

// Lazy-init vector store (chỉ tạo 1 lần)
let _vectorStore: any = null;
async function getVectorStore() {
  if (!_vectorStore) _vectorStore = await createVectorStore();
  return _vectorStore;
}

/**
 * getChatResponse: Xử lý chat request
 * Tương đương ChatBotService.getChatResponse() trong Java
 *
 * Luồng:
 * 1. Phân tích message → RAG filter
 * 2. Semantic search Qdrant → relevant docs
 * 3. Load chat history từ Redis
 * 4. Bind tools vào LLM
 * 5. Gửi prompt → LLM → parse JSON response
 * 6. Save lịch sử vào Redis
 */
export async function getChatResponse(
  userMessage: string,
  conversationId: string
): Promise<ChatResponse> {
  // 1. Xây dựng RAG filter (tương đương RagFilterBuilder.buildFilterExpression())
  const filterExpr = buildFilterExpression(userMessage);

  // 2. Semantic search trong Qdrant
  const vectorStore = await getVectorStore();
  const relevantDocs = await vectorStore.similaritySearch(userMessage, 10, filterExpr);

  const ragContext = relevantDocs
    .map((doc: any) => `[CONTEXT]\n${doc.pageContent}\nMetadata: ${JSON.stringify(doc.metadata)}\n`)
    .join("\n---\n");

  // 3. Load chat history từ Redis (tương đương MessageChatMemoryAdvisor)
  const memory = createChatMemory(conversationId);
  const history = await memory.chatHistory.getMessages();

  // 4. Tạo LLM với tools (tương đương ChatClient.defaultTools(showtimeTool))
  const llm = createChatModel();
  const llmWithTools = llm.bindTools(courseTools);

  // 5. Tạo messages array (system + history + user)
  const systemPrompt = buildSystemPrompt();
  const messages = [
    new SystemMessage(systemPrompt + "\n\n# DỮ LIỆU NGỮ CẢNH:\n" + (ragContext || "Không có dữ liệu ngữ cảnh liên quan.")),
    ...history,
    new HumanMessage(userMessage),
  ];

  // 6. Gọi LLM (lần 1: có thể trả về tool_calls)
  let response = await llmWithTools.invoke(messages);

  // 7. Xử lý tool calls nếu có (tương đương ToolCallAdvisor trong Java)
  if (response.tool_calls && response.tool_calls.length > 0) {
    const toolMessages: any[] = [response];

    for (const toolCall of response.tool_calls) {
      const tool = courseTools.find((t) => t.name === toolCall.name);
      if (tool) {
        const toolResult = await tool.invoke(toolCall.args);
        toolMessages.push({
          role: "tool",
          content: typeof toolResult === "string" ? toolResult : JSON.stringify(toolResult),
          tool_call_id: toolCall.id,
        });
      }
    }

    // Gọi LLM lần 2 với kết quả tool để tổng hợp câu trả lời
    const finalMessages = [...messages, ...toolMessages];
    response = await llmWithTools.invoke(finalMessages);
  }

  // 8. Save lịch sử vào Redis (tương đương RedisChatMemoryRepository.saveAll())
  await memory.chatHistory.addMessage(new HumanMessage(userMessage));
  await memory.chatHistory.addMessage(new AIMessage(response.content as string));

  // 9. Parse JSON response (tương đương .call().entity(ChatResponse.class))
  let parsed: ChatResponse;
  try {
    const raw = (response.content as string).trim();
    // Bỏ markdown code block nếu có
    const clean = raw.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    parsed = JSON.parse(clean);
  } catch {
    // Fallback nếu LLM không trả về JSON đúng format
    parsed = {
      type: "text",
      message: response.content as string,
    };
  }

  return parsed;
}
```

---

## 🌐 PHASE 8: CONTROLLER & ROUTE

**Tương đương:** `ChatBotController.java` + `ChatBotService`

```typescript
// src/chatbot/controllers/chatbotController.ts
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { getChatResponse } from "../services/chatbotService.js";

export const chat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Validate (tương đương validateMessage trong Java)
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        type: "error",
        message: "Tin nhắn không được để trống.",
      });
    }

    // 2. Lấy userId → tạo conversationId (tương đương chatId = "user:" + userId trong Java)
    const userId = req.jwtDecoded?.id;
    const conversationId = `user:${userId}`;

    // 3. Gọi chatbot service
    const response = await getChatResponse(message.trim(), conversationId);

    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    next(error);
  }
};

export const chatbotController = { chat };
```

```typescript
// src/chatbot/routes/chatbotRoute.ts
import express from "express";
import { chatbotController } from "../controllers/chatbotController.js";
import { authMiddleware } from "@/middlewares/authMiddleware.js";

const Router = express.Router();

/**
 * POST /chatbot/chat
 * Body: { message: string }
 * Auth: Bearer JWT required
 */
Router.route("/chat").post(
  authMiddleware.isAuthorized,
  chatbotController.chat
);

export const chatbotRoute = Router;
```

---

## 🔌 PHASE 9: ĐĂNG KÝ ROUTE & KHỞI ĐỘNG

### 9.1 Đăng ký route vào `src/routes/v1/index.ts`

Thêm vào file index.ts hiện có:

```typescript
// Thêm import:
import { chatbotRoute } from "../../chatbot/routes/chatbotRoute.js";

// Thêm route (trong body của Router):
Router.use("/chatbot", chatbotRoute);
```

### 9.2 Nạp dữ liệu RAG khi khởi động server

Sửa `server.ts` để gọi `ragDataLoader` sau khi server start (tương đương `ApplicationRunner` trong Java):

```typescript
// server.ts - thêm vào sau khi server start
import { createVectorStore } from "./chatbot/config/aiConfig.js";
import { ingestAll } from "./chatbot/services/ragIngestionService.js";

// Trong phần khởi động server:
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Khởi động RAG Data Loader (tương đương ApplicationRunner trong Java)
  try {
    console.log("📚 Bắt đầu nạp dữ liệu RAG vào Vector Store...");
    const vectorStore = await createVectorStore();
    const count = await ingestAll(vectorStore);
    console.log(`✅ Đã nạp ${count} documents vào Qdrant`);
  } catch (err) {
    console.error("❌ Lỗi nạp dữ liệu RAG:", err);
  }
});
```

---

## 🐳 PHASE 10: CHẠY INFRASTRUCTURE (Docker)

Qdrant cần chạy trước khi start server:

```bash
# Chạy Qdrant (tương đương docker-compose up qdrant trong Java project)
docker run -d \
  --name qdrant \
  -p 6334:6334 \
  -p 6333:6333 \
  qdrant/qdrant

# Kiểm tra Qdrant đã chạy:
curl http://localhost:6333/health
# Expected: {"title":"qdrant - vector search engine","version":"..."}

# Redis (nếu chưa có)
docker run -d \
  --name redis-elearning \
  -p 6379:6379 \
  redis:alpine
```

Hoặc dùng `docker-compose.yml`:

```yaml
# docker-compose.yml (thêm vào compose hiện có)
services:
  qdrant:
    image: qdrant/qdrant
    ports:
      - "6334:6334"
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

volumes:
  qdrant_data:
```

---

## 📋 BẢNG ĐỐI CHIẾU JAVA → NODE.JS

| **Java (Spring AI)** | **Node.js (LangChain)** | **Mục đích** |
|---------------------|------------------------|--------------|
| `AiConfig.java` | `aiConfig.ts` | Cấu hình LLM, VectorStore, Memory |
| `ChatBotController.java` | `chatbotController.ts` | REST API endpoint |
| `ChatBotService.java` | `chatbotService.ts` | Business logic xử lý chat |
| `ChatSystemPrompt.java` | `chatSystemPrompt.ts` | System prompt |
| `RagIngestionService.java` | `ragIngestionService.ts` | Nạp dữ liệu vào VectorStore |
| `RagDataLoader.java` | `server.ts` startup block | Auto-load khi khởi động |
| `RagDocumentMapper.java` | `ragDocumentMapper.ts` | Entity → Document |
| `RedisChatMemoryRepository.java` | `BufferWindowMemory` + `RedisChatMessageHistory` | Lưu lịch sử chat |
| `ShowtimeTool.java` (`@Tool`) | `courseTool.ts` (`tool()`) | Function Calling |
| `RagFilterBuilder.java` | `ragFilterBuilder.ts` | Phân tích message → filter |
| `QuestionAnswerAdvisor` (topK=20, threshold=0.50) | `vectorStore.similaritySearch(msg, 10, filter)` | RAG search |
| `MessageWindowChatMemory(maxMessages=30)` | `BufferWindowMemory({ k: 30 })` | Giới hạn lịch sử |
| `application.yml` (GEMINI_KEY, Qdrant, Redis) | `.env` (GEMINI_KEY, QDRANT_*, REDIS_*) | Cấu hình |

---

## 💡 VÍ DỤ LUỒNG HOÀN CHỈNH

**User gõ:** `"Tôi muốn học lập trình web, có khóa nào phù hợp cho người mới bắt đầu không?"`

```
1. RagFilterBuilder phát hiện: "khoa", "lap trinh", "co ban"
   → filter: { must: [{ type: "course" }, { level: "Beginner" }, { status: "published" }] }

2. Qdrant search top 10 courses liên quan "lập trình web Beginner"
   → [Khóa HTML/CSS cơ bản, Khóa JavaScript..., ...]

3. Redis load lịch sử hội thoại của user

4. Prompt = SystemPrompt + [CONTEXT từ Qdrant] + History + UserMessage

5. LLM quyết định gọi tool: searchCourses({ keyword: "lập trình web", level: "Beginner" })

6. courseTool query Prisma → trả về 10 khóa học

7. LLM tổng hợp → trả về JSON:
{
  "type": "course_list",
  "message": "Với mục tiêu học lập trình web cho người mới bắt đầu, tôi gợi ý những khóa sau...",
  "courses": [
    { "id": 1, "name": "HTML & CSS Cơ Bản", "level": "Beginner", "price": 0, ... },
    { "id": 2, "name": "JavaScript Nhập Môn", "level": "Beginner", "price": 299000, ... }
  ]
}

8. Redis save lịch sử
9. Response trả về client
```

---

## 🚀 KIỂM TRA API

```bash
# Đăng nhập lấy JWT token
curl -X POST http://localhost:3000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "student@test.com", "password": "123456"}'

# Gọi chatbot (thay YOUR_JWT_TOKEN)
curl -X POST http://localhost:3000/api/v1/chatbot/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"message": "Tôi muốn học Python, có khóa học nào không?"}'

# Expected response:
{
  "type": "course_list",
  "message": "Tôi tìm thấy các khóa học Python phù hợp với bạn...",
  "courses": [...]
}
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **Gemini API Key**: Đăng ký tại [Google AI Studio](https://aistudio.google.com/) - miễn phí tier có sẵn
2. **Qdrant collection** sẽ tự tạo khi `ingestAll()` chạy lần đầu
3. **RAG data** được nạp lại mỗi lần restart server - có thể tối ưu bằng cách check collection đã có data chưa trước khi xóa
4. **Token limit**: System prompt + RAG context + history có thể dài, nên giới hạn `k=10` cho RAG search và `k=20` cho chat history (hiện đang dùng 30 như Java)
5. **Qdrant filter** trong LangChain JS dùng format khác Java Spring AI - cần test kỹ phần `buildFilterExpression`
6. **Function calling** với Gemini qua OpenAI-compatible API: đảm bảo dùng version model hỗ trợ tools (gemini-2.5-flash ✅)

---

*Generated based on: Java Spring AI chatbot (Movie Ticket Booking) + E-Learning Backend (Node.js/TypeScript/Prisma)*
