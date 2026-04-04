# 📚 Hướng Dẫn Nghiệp Vụ: Tạo & Quản Lý Course

> Tài liệu này mô tả toàn bộ luồng nghiệp vụ liên quan đến việc tạo, duyệt và quản lý khoá học trong hệ thống E-Learning.

---

## 🎯 Tổng Quan Luồng Tạo Course

```
Lecturer                Admin                  System
   │                      │                      │
   ├─ 1. Tạo Course ──────────────────────────►  │
   │   (status: draft)    │                      │
   │                      │                      │
   ├─ 2. Upload Thumbnail ────────────────────►  │
   │   (Cloudinary via    │                      │
   │    multer middleware) │                      │
   │                      │                      │
   ├─ 3. Thêm Module ─────────────────────────►  │
   │   (≥1 module)         │                      │
   │                      │                      │
   ├─ 4. Thêm Lesson ─────────────────────────►  │
   │   (kèm video)         │                      │
   │                      │                      │
   ├─ 5. Submit Review ───────────────────────►  │
   │   (status: pending)   │                      │
   │                      │                      │
   │              ◄─ 6. Duyệt/Từ chối ──────────┤
   │                      │                      │
   │              Admin approve ──────────────►  │
   │                   (status: published)        │
```

---

## 🔐 Phân Quyền

| Vai trò | Quyền |
|---|---|
| `admin` | CRUD toàn bộ course; duyệt / từ chối; xem admin list |
| `lecturer` | Tạo course của mình; sửa/xoá course của mình; không thể tự publish |
| `student` | Chỉ xem course đã `published` |

---

## 📦 BƯỚC 1: Tạo Course

### Endpoint
```
POST /api/v1/course/
Authorization: Bearer <token> (Lecturer hoặc Admin)
```

### Body
```json
{
  "lecturerId": 3,
  "categoryId": 1,
  "name": "Khoá học React Nâng Cao",
  "lecturerName": "Nguyễn Văn A",
  "duration": "30 giờ",
  "level": "Intermediate",
  "overview": "Mô tả tổng quan khoá học...",
  "price": 299000,
  "status": "draft",
  "thumbnail": {
    "publicId": "uploads/abc123",
    "fileUrl": "https://res.cloudinary.com/.../abc123.jpg",
    "fileSize": 204800,
    "fileType": "image/jpeg"
  }
}
```

### Logic Backend (`courseService.createCourse`)

```
1. Kiểm tra tên course có bị trùng không (findFirst by name)
   └─ Nếu trùng → throw ApiError 409 CONFLICT

2. Dùng prisma.$transaction để đảm bảo atomic:
   a. Tạo Resource record cho thumbnail (publicId, fileUrl, fileSize, fileType)
   b. Nếu có introVideo → tạo Resource record thứ 2
   c. Tạo Course record với thumbnailId trỏ vào Resource vừa tạo
   
3. Return newCourse
```

> **Lưu ý quan trọng**: Resource (thumbnail, intro video) được lưu trong bảng `Resource`
> riêng biệt, không lưu trực tiếp URL vào bảng `Course`. Điều này giúp quản lý file tập trung.

---

## 🖼️ Upload Thumbnail & Intro Video

### Upload Thumbnail
```
POST /api/v1/course/thumbnail
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body: { images: <file> }
```

### Upload Intro Video
```
POST /api/v1/course/intro-video
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body: { video: <file> }
```

Cả 2 endpoint dùng **multer middleware** + **Cloudinary** để upload. Response trả về object `Resource` với `publicId` và `fileUrl` — dùng để gắn vào body khi tạo course.

### Thứ tự thao tác đúng:
```
1. Upload thumbnail → nhận { publicId, fileUrl, ... }
2. Upload intro video (nếu có) → nhận { publicId, fileUrl, ... }  
3. POST /course/ với dữ liệu { ..., thumbnail: {...}, introVideo: {...} }
```

---

## 📁 BƯỚC 2: Tạo Module

Module là chương / phần của khoá học. Mỗi course phải có ít nhất 1 module trước khi được publish.

### Endpoint
```
POST /api/v1/module/
Authorization: Bearer <token> (chỉ Lecturer sở hữu course)
```

### Body
```json
{
  "courseId": 5,
  "title": "Chương 1: Giới thiệu React",
  "description": "Tổng quan về React và ecosystem",
  "duration": "3 giờ",
  "totalLessons": 5
}
```

### Logic Backend (`moduleService.createModule`)
```
1. ensureLecturerOwnsCourse(actorId, courseId)
   └─ Load course, kiểm tra course.lecturerId === actorId
   └─ Nếu không khớp → throw 403 FORBIDDEN

2. Kiểm tra course tồn tại

3. Kiểm tra title module có bị trùng trong cùng courseId không
   └─ Nếu trùng → throw 409 CONFLICT

4. prisma.module.create({ courseId, title, description, ... })
```

---

## 📝 BƯỚC 3: Tạo Lesson

Lesson là bài học trong một Module. Bắt buộc phải có `video`.

### Endpoint
```
POST /api/v1/lesson/
Authorization: Bearer <token>
```

### Upload video trước
```
POST /api/v1/lesson/upload-video
Content-Type: multipart/form-data
Body: { video: <file> }
```

### Body tạo Lesson
```json
{
  "moduleId": 10,
  "title": "Bài 1: useState Hook",
  "description": "Giới thiệu và thực hành useState",
  "note": "Xem thêm tài liệu tại...",
  "duration": "25 phút",
  "video": {
    "publicId": "videos/xyz789",
    "fileUrl": "https://res.cloudinary.com/.../xyz789.mp4",
    "fileSize": 52428800,
    "fileType": "video/mp4"
  },
  "resource": {
    "publicId": "docs/slide01",
    "fileUrl": "https://res.cloudinary.com/.../slide01.pdf",
    "fileSize": 1048576,
    "fileType": "application/pdf"
  }
}
```

### Logic Backend (`lessonService.createLesson`)
```
1. ensureLecturerOwnsCourse(actorId, moduleId)
   └─ Load module → lấy course.lecturerId → kiểm tra quyền

2. Kiểm tra module tồn tại

3. Kiểm tra title lesson có trùng trong module không

4. prisma.$transaction:
   a. Nếu có resource (file PDF) → tạo Resource record
   b. Tạo Resource record cho video (bắt buộc)
   c. Tạo Lesson record:
      { moduleId, title, description, note, duration, 
        lessonVideoId: videoResource.id,
        lessonFileId: fileResource?.id || null }
```

---

## ✅ BƯỚC 4: Submit để Duyệt (Lecturer)

Sau khi tạo xong nội dung, Lecturer submit để Admin duyệt.

### Endpoint
```
PUT /api/v1/course/:id
Authorization: Bearer <token>
```

### Body
```json
{
  "status": "pending"
}
```

> **Lưu ý**: Lecturer **không thể** tự set `status: "published"` — chỉ Admin mới có quyền.

---

## ✅ BƯỚC 5: Admin Duyệt / Từ Chối

### Duyệt (Approve)
```
PUT /api/v1/course/approve-course/:id
Authorization: Bearer <token> (Admin only)
```

### Logic
```
1. ensureCourseOwnerOrAdmin → kiểm tra actor là admin
2. Kiểm tra status phải là "pending" hoặc "draft"
3. Nếu đã "published" → throw 400
4. prisma.course.update({ status: "published" })
```

### Từ chối (Reject)
```
PUT /api/v1/course/reject-course/:id
Authorization: Bearer <token> (Admin only)
```

### Logic tương tự nhưng `status: "rejected"`

---

## 🔍 Điều Kiện Để Publish Course

Khi Admin duyệt, hệ thống kiểm tra hàm `canPublishCourse`:

```typescript
const canPublishCourse = async (courseId: number) => {
  const [course, moduleCount] = await Promise.all([
    prisma.course.findUnique({ where: { id: courseId } }),
    prisma.module.count({ where: { courseId, isDestroyed: false } })
  ]);

  if (!course.name || !course.thumbnailId || moduleCount === 0) {
    throw new ApiError(400, "Course is incomplete to publish!");
  }
};
```

**Course phải có đủ:**
- ✅ Tên (`name`)  
- ✅ Thumbnail (`thumbnailId`)  
- ✅ Ít nhất 1 module

---

## 📊 Sơ Đồ Trạng Thái (Status Flow)

```
    ┌─────────────────────────────────────────────┐
    │                                             │
    ▼                                             │
[draft] ──(Lecturer submit)──► [pending] ──(Admin approve)──► [published]
   ▲                                │
   │                                └──(Admin reject)──► [rejected]
   │                                                          │
   └──────────────────────────────────────────────────────────┘
         (Lecturer có thể edit lại rồi submit tiếp)
```

| Status | Ai set | Mô tả |
|---|---|---|
| `draft` | Lecturer (mặc định) | Đang soạn thảo |
| `pending` | Lecturer | Đã nộp để duyệt |
| `published` | Admin | Đã duyệt, hiển thị công khai |
| `rejected` | Admin | Bị từ chối, Lecturer cần chỉnh sửa |

---

## 🗂️ API Overview Table

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| `POST` | `/course/` | Lecturer/Admin | Tạo course mới |
| `PUT` | `/course/:id` | Owner/Admin | Cập nhật course |
| `DELETE` | `/course/:id` | Owner/Admin | Soft delete course |
| `GET` | `/course/` | Public | Danh sách course published |
| `GET` | `/course/get-course-by-id/:id` | Public | Chi tiết course |
| `POST` | `/course/thumbnail` | Lecturer/Admin | Upload thumbnail |
| `POST` | `/course/intro-video` | Lecturer/Admin | Upload intro video |
| `PUT` | `/course/approve-course/:id` | Admin | Phê duyệt |
| `PUT` | `/course/reject-course/:id` | Admin | Từ chối |
| `GET` | `/course/lecturer/my-courses` | Lecturer | Courses của Lecturer |
| `GET` | `/course/admin/list` | Admin | Tất cả courses (có filter) |
| `POST` | `/module/` | Lecturer | Tạo module |
| `PUT` | `/module/:id` | Owner | Cập nhật module |
| `POST` | `/lesson/` | Lecturer | Tạo lesson |
| `POST` | `/lesson/upload-video` | Lecturer | Upload video bài giảng |
| `POST` | `/course/faq` | Lecturer/Admin | Thêm FAQ |

---

## ⚡ Lưu Ý Quan Trọng Khi Implement

### 1. Transaction Pattern
Mọi thao tác liên quan đến `Resource` (file) đều phải dùng `prisma.$transaction` để đảm bảo nếu tạo record thất bại thì file record cũng không bị tạo orphan.

```typescript
// ✅ Đúng
await prisma.$transaction(async (tx) => {
  const resource = await resourceService.createResourceWithTransaction(data, tx);
  const course = await tx.course.create({ data: { thumbnailId: resource.id, ... }});
  return course;
});
```

### 2. Soft Delete
Xoá course là **soft delete** (`isDestroyed: true`), không xoá thật. Mọi query phải luôn có `where: { isDestroyed: false }`.

### 3. Security Guards
Mỗi service có các guard function riêng:
- `ensureLecturerOrAdmin(userId)` — Kiểm tra role
- `ensureCourseOwnerOrAdmin(courseId, userId)` — Kiểm tra cả role lẫn ownership
- `ensureLecturerOwnsCourse(actorId, courseId/moduleId)` — Dùng trong Module/Lesson service

### 4. Resource Service
Tất cả file (thumbnail, video, PDF) đều lưu qua `resourceService`:
- `createResourceWithTransaction(data, tx)` — Tạo trong transaction
- `deleteResourceWithTransaction(id, tx)` — Xoá trong transaction (dùng khi update file)

---

## 🛠️ Checklist Tạo Course Hoàn Chỉnh

- [ ] Upload thumbnail → lưu `publicId` và `fileUrl`
- [ ] (Tuỳ chọn) Upload intro video → lưu `publicId` và `fileUrl`
- [ ] `POST /course/` với đầy đủ thông tin + thumbnail
- [ ] `POST /module/` tạo ít nhất 1 module
- [ ] `POST /lesson/upload-video` để upload video từng bài
- [ ] `POST /lesson/` tạo lesson kèm `video` data
- [ ] (Tuỳ chọn) `POST /course/faq` thêm FAQ
- [ ] `PUT /course/:id` với `{ status: "pending" }` để submit duyệt
- [ ] Admin `PUT /course/approve-course/:id` để publish
