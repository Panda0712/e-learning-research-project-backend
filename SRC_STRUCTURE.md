# Cấu Trúc Thư Mục `src/`

## 📍 Vị Trí File `.env`
File `.env` được đặt ở **thư mục gốc của project** (cùng cấp với `package.json`, `server.ts`).

---

## 📂 Cấu Trúc Chi Tiết

### 📄 Files Chính

#### `app.ts`
- **Chức năng**: File cấu hình chính của Express application
- **Nhiệm vụ**:
  - Khởi tạo Express app
  - Cấu hình middleware (morgan, helmet, compression, cookie-parser)
  - Thiết lập routes
  - Xử lý error handling

#### `schema.ts`
- **Chức năng**: File định nghĩa schema cho validation hoặc GraphQL
- **Nhiệm vụ**: Chứa các schema definitions cho dự án

---

### 📁 Thư Mục Chính

#### `configs/`
**Chức năng**: Quản lý cấu hình của ứng dụng

- **`environment.ts`**: 
  - Export các biến môi trường từ file `.env`
  - Chứa cấu hình cho:
    - Database (MySQL, DATABASE_URL)
    - Server (APP_HOST, APP_PORT)
    - Email services (Brevo, Resend, MailerSend)
    - Website domains

---

#### `controllers/`
**Chức năng**: Xử lý business logic của các API endpoints

- **`userController.ts`**: Controller xử lý các request liên quan đến User
  - Đăng ký, đăng nhập, cập nhật profile
  - Quản lý thông tin người dùng

---

#### `db/`
**Chức năng**: Chứa các file liên quan đến database
- Có thể chứa seeders, migrations helpers, hoặc database utilities

---

#### `generated/`
**Chức năng**: Chứa code được auto-generate bởi Prisma

- **`prisma/`**: 
  - Prisma Client được generate tự động
  - Chứa types, models, và enums cho database
  - **Không nên edit thủ công** - được generate từ `prisma/schema.prisma`

**Các files/folders chính**:
- `client.ts`: Prisma Client
- `enums.ts`: Database enums
- `models/`: Các model types (User, Course, Enrollment, etc.)

---

#### `helpers/`
**Chức năng**: Các helper functions tiện ích

- **`asyncHandler.ts`**: 
  - Wrapper function để xử lý async/await trong Express
  - Tự động catch errors trong async route handlers

---

#### `lib/`
**Chức năng**: Thư viện và utilities được chia sẻ

- **`prisma.ts`**: 
  - Khởi tạo và export Prisma Client instance
  - Singleton pattern cho database connection

---

#### `loggers/`
**Chức năng**: Cấu hình logging system
- Winston, Pino, hoặc logging library khác
- Format và quản lý application logs

---

#### `logs/`
**Chức năng**: Lưu trữ log files
- Application logs
- Error logs
- Access logs

---

#### `middlewares/`
**Chức năng**: Express middlewares

- **`errorHandlingMiddleware.ts`**: 
  - Centralized error handling
  - Xử lý và format errors trước khi response cho client

---

#### `models/`
**Chức năng**: Business models hoặc domain models
- Có thể chứa business logic không liên quan trực tiếp đến database
- Domain-specific logic

---

#### `postman/`
**Chức năng**: API testing collections
- Postman collections cho testing APIs
- Environment configurations
- API documentation

---

#### `providers/`
**Chức năng**: External service providers và integrations

**Email Providers**:
- **`BrevoProvider.ts`**: Integration với Brevo (SendinBlue) email service
- **`ResendProvider.ts`**: Integration với Resend email service
- **`MailerSendProvider.ts`**: Basic MailerSend integration
- **`MailerSendWithAttachmentsProvider.ts`**: MailerSend với file đính kèm
- **`MailerSendWithInlineAttachmentsProvider.ts`**: MailerSend với inline attachments
- **`MailerSendWithScheduleAndBulkEmailsProvider.ts`**: MailerSend với scheduled và bulk emails
- **`MailerSendWithTemplateProvider.ts`**: MailerSend với email templates

---

#### `routes/`
**Chức năng**: Định nghĩa API routes

- **`v1/`**: API version 1
  - **`index.ts`**: Tổng hợp tất cả routes v1
  - **`userRoute.ts`**: Routes cho user-related endpoints

**Cấu trúc**: Versioned API để dễ dàng maintain và upgrade

---

#### `services/`
**Chức năng**: Business logic layer

- **`keyTokenService.ts`**: 
  - Quản lý authentication tokens
  - JWT, refresh tokens

- **`userService.ts`**: 
  - Business logic cho User operations
  - CRUD operations, authentication logic

---

#### `test/`
**Chức năng**: Test files
- Unit tests
- Integration tests
- Test utilities

---

#### `types/`
**Chức năng**: TypeScript type definitions

- **`authUtilsPayload.type.ts`**: Types cho authentication payloads
- **`keyStore.type.ts`**: Types cho key storage
- **`registerLecturer.type.ts`**: Types cho lecturer registration
- **`updateProfile.type.ts`**: Types cho profile updates
- **`user.type.ts`**: User-related types

---

#### `uploads/`
**Chức năng**: Lưu trữ uploaded files
- User avatars
- Course resources
- Documents
- Images

---

#### `utils/`
**Chức năng**: Utility functions và helpers

- **`ApiError.ts`**: 
  - Custom Error class cho API errors
  - Standardized error responses

- **`auth.ts`**: 
  - Authentication utilities
  - Token generation/verification

- **`constants.ts`**: 
  - Application constants
  - Magic numbers, configurations

- **`formatters.ts`**: 
  - Data formatting utilities
  - Response formatters

- **`validators.ts`**: 
  - Validation helper functions
  - Custom validators

---

#### `validations/`
**Chức năng**: Request validation schemas

- **`userValidation.ts`**: 
  - Validation schemas cho User endpoints
  - Input validation rules (Joi, Zod, hoặc validator khác)

---

## 🔄 Flow Hoạt Động

```
Request → Routes → Validations → Controllers → Services → Prisma → Database
                        ↓
                   Middlewares
                        ↓
                  Error Handling
```

## 📝 Ghi Chú

1. **Environment Variables**: Được quản lý qua file `.env` ở root directory
2. **Database**: Sử dụng Prisma ORM với MySQL
3. **Email**: Hỗ trợ nhiều providers (Brevo, Resend, MailerSend)
4. **API Versioning**: Sử dụng `/v1` prefix cho version control
5. **Error Handling**: Centralized error handling với custom ApiError class
