# 🎟️ VOUCHER / COUPON BUSINESS GUIDE

> Hướng dẫn nghiệp vụ áp dụng Voucher/Coupon cho đơn hàng khóa học  
> Dự án: E-Learning Research Project Backend  
> Ngày cập nhật: 2026-04-04

---

## 📋 MỤC LỤC

1. [Đánh giá hiện trạng](#1-đánh-giá-hiện-trạng)
2. [Các vấn đề cần cải thiện](#2-các-vấn-đề-cần-cải-thiện)
3. [Thiết kế nghiệp vụ mới](#3-thiết-kế-nghiệp-vụ-mới)
4. [Thay đổi Schema Database](#4-thay-đổi-schema-database)
5. [Hướng dẫn thực hiện từng bước](#5-hướng-dẫn-thực-hiện-từng-bước)
6. [API Endpoints](#6-api-endpoints)
7. [Luồng xử lý tổng thể](#7-luồng-xử-lý-tổng-thể)

---

## 1. Đánh giá hiện trạng

### 1.1 Schema Coupon hiện tại (`prisma/schema.prisma`)

```prisma
model Coupon {
  id            Int       @id @default(autoincrement())
  name          String
  description   String?
  status        String?
  code          String    @unique
  courseId      Int?          // ← Gắn với 1 khóa học cụ thể
  categoryId    Int?          // ← Hoặc gắn với danh mục coupon
  discount      Float?
  discountUnit  String?       // amount | percent
  usageLimit    Int?          // Số lần dùng tối đa
  minOrderValue Float?        // Giá trị đơn hàng tối thiểu
  maxValue      Float?        // Giá trị giảm tối đa
  amount        Float?        // Số tiền giảm cụ thể
  startingDate  DateTime?
  startingTime  String?
  endingDate    DateTime?
  endingTime    String?
  ...
}
```

### 1.2 Luồng áp dụng voucher hiện tại

**Trong `orderService.ts` (`createOrder`)**:
```typescript
if (data.couponCode) {
  const coupon = await prisma.coupon.findUnique({ where: { code: ... } });
  if (coupon && coupon.status === "active") {
    if (coupon.discountUnit === "percent") {
      totalPrice = totalPrice * (1 - discountValue / 100);
    } else {
      totalPrice = Math.max(0, totalPrice - fixedAmount);
    }
  }
}
```

**Trong `transactionService.ts` (`createTransaction`)**:
```typescript
// Validate coupon per item
for (const item of items) {
  if (item.discountCode) { ... validate ... }
}
// Sau khi tạo transaction thành công → giảm usageLimit
await prisma.coupon.update({ data: { usageLimit: { decrement: 1 } } });
```

---

## 2. Các vấn đề cần cải thiện

### ❌ Vấn đề 1: Logic coupon bị phân tán và xung đột

| Nơi xử lý | Mô tả |
|-----------|-------|
| `orderService.ts` | Áp dụng discount vào `totalPrice` khi tạo order |
| `transactionService.ts` | Validate coupon lại một lần nữa khi tạo transaction |
| `couponService.ts` | `verifyCouponCode()` — verify lần 3 |

→ **Hậu quả**: Logic không nhất quán, khó maintain, dễ xảy ra race condition.

### ❌ Vấn đề 2: Không lưu thông tin coupon vào Order

- Model `Order` không có trường `couponCode` hay `discountAmount`
- Khi order được tạo với coupon, thông tin giảm giá bị mất → không thể tra cứu lại
- Không biết đơn hàng nào đã dùng coupon nào

### ❌ Vấn đề 3: `usageLimit` không tracking số lần đã dùng

- Chỉ có `usageLimit` (giới hạn), không có `usedCount` (đã dùng bao nhiêu)
- Khi order bị hủy/thất bại, không hoàn trả `usageLimit` về
- Không thể báo cáo: "Coupon X đã được dùng bao nhiêu lần?"

### ❌ Vấn đề 4: Không có `usagePerUser` — một user có thể dùng 1 coupon nhiều lần

- Không kiểm soát được việc 1 user dùng cùng 1 coupon nhiều lần
- Cần bảng lịch sử sử dụng coupon của từng user

### ❌ Vấn đề 5: `verifyCouponCode()` không kiểm tra `minOrderValue`

```typescript
// Hiện tại chỉ check: status, ngày hết hạn, usageLimit
// THIẾU: check minOrderValue so với giá trị giỏ hàng thực tế
const verifyCouponCode = async (code: string) => { ... }
```

→ Frontend call `verifyCouponCode` mà không biết giá trị giỏ hàng → không thể validate `minOrderValue`.

### ❌ Vấn đề 6: Discount áp dụng cho toàn bộ order, không track per-item

- Khi giảm giá `totalPrice` tổng, không biết từng `OrderItem` được giảm bao nhiêu
- Revenue calculation bị sai: lecturer nhận phần trăm từ giá gốc hay giá sau giảm?

### ❌ Vấn đề 7: `calcAmountFromDiscount()` tính sai với percent

```typescript
// Hiện tại:
const baseAmount = discountUnit === "percent"
  ? (normalizedMinOrder > 0
      ? (normalizedMinOrder * normalizedDiscount) / 100   // ← Dùng minOrderValue để tính
      : normalizedDiscount)                                // ← Không có minOrder thì trả về % thô
  : normalizedDiscount;
```

→ Khi `discountUnit = "percent"` và không có `minOrderValue`, hàm trả về `normalizedDiscount` (ví dụ: `20` thay vì `20%`). Đây là logic sai.

---

## 3. Thiết kế nghiệp vụ mới

### 3.1 Phạm vi áp dụng Coupon

```
Coupon có thể áp dụng cho:
├── ALL_COURSES    - Toàn bộ khóa học (toàn sàn)
├── CATEGORY       - Theo danh mục khóa học (categoryId trên Course)  
└── SPECIFIC_COURSE - Chỉ một khóa học cụ thể (courseId)
```

### 3.2 Loại giảm giá

```
discountUnit:
├── "percent"  - Giảm theo % (ví dụ: 20%)
│                maxValue giới hạn số tiền giảm tối đa
└── "amount"   - Giảm cố định (ví dụ: 50,000đ)
```

### 3.3 Quy tắc áp dụng

```
1. Mỗi order chỉ dùng 1 coupon
2. Kiểm tra đủ điều kiện TRƯỚC khi tạo order:
   - status = "active"
   - startingDate <= now <= endingDate
   - usedCount < usageLimit (nếu usageLimit != null)
   - totalPrice >= minOrderValue (nếu minOrderValue != null)
   - Phạm vi áp dụng (scope) phải match với courses trong order
   - User chưa vượt quá usagePerUser (nếu có)
3. Ghi nhận việc dùng coupon vào CouponUsage ngay khi order thành công
4. Nếu order bị hủy → hoàn trả: usedCount - 1
```

### 3.4 Cách tính giảm giá

```typescript
function calculateDiscount(coupon, eligibleItemsTotal):
  if discountUnit == "percent":
    discountAmount = eligibleItemsTotal * (discount / 100)
    if maxValue != null:
      discountAmount = min(discountAmount, maxValue)
  else: // "amount"
    discountAmount = min(coupon.amount, eligibleItemsTotal)
  
  finalTotal = eligibleItemsTotal - discountAmount
  return { discountAmount, finalTotal }
```

### 3.5 Ai được hưởng discount?

```
Discount áp dụng cho các items trong order match với coupon scope:
- scope = ALL_COURSES → tất cả items
- scope = CATEGORY → các items thuộc category đó
- scope = SPECIFIC_COURSE → chỉ item đó

Các items không match → giá gốc
→ finalTotal = eligibleItems_priceAfterDiscount + ineligibleItems_originalPrice
```

---

## 4. Thay đổi Schema Database

### 4.1 Cập nhật model `Coupon`

```prisma
model Coupon {
  id            Int       @id @default(autoincrement())
  name          String
  description   String?
  status        String?   @default("active") // active | inactive | expired
  code          String    @unique
  
  // === SCOPE - Phạm vi áp dụng ===
  scope         String    @default("ALL_COURSES") // ALL_COURSES | CATEGORY | SPECIFIC_COURSE
  courseId      Int?      // Chỉ dùng khi scope = SPECIFIC_COURSE
  scopeCategoryId Int?    // Chỉ dùng khi scope = CATEGORY (category của Course, không phải CouponCategory)
  
  // === CATEGORIZATION ===
  categoryId    Int?      // Danh mục nhóm coupon (CouponCategory) - giữ nguyên
  
  // === DISCOUNT ===
  discount      Float?    // Giá trị giảm (% hoặc số tiền)
  discountUnit  String?   @default("percent") // percent | amount
  minOrderValue Float?    // Giá trị đơn hàng tối thiểu để áp dụng
  maxValue      Float?    // Số tiền giảm tối đa (dùng với percent)
  amount        Float?    // Số tiền giảm cụ thể (tính toán sẵn, dùng để preview)
  
  // === USAGE TRACKING ===
  usageLimit    Int?      // Tổng số lần coupon được dùng (null = không giới hạn)
  usedCount     Int       @default(0)  // ← MỚI: Số lần đã dùng thực tế
  usagePerUser  Int?      // ← MỚI: Số lần tối đa mỗi user được dùng (null = không giới hạn)
  
  // === TIME ===
  startingDate  DateTime?
  endingDate    DateTime?
  
  // Giữ lại các trường cũ cho backward compat
  startingTime  String?
  endingTime    String?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime? @updatedAt
  isDestroyed   Boolean   @default(false)

  // relations
  category      CouponCategory? @relation(fields: [categoryId], references: [id])
  course        Course?         @relation(fields: [courseId], references: [id])
  usages        CouponUsage[]   // ← MỚI
  orders        Order[]         // ← MỚI (via Order.couponId)
}
```

### 4.2 Model `CouponUsage` mới — lịch sử dùng coupon

```prisma
model CouponUsage {
  id         Int      @id @default(autoincrement())
  couponId   Int
  userId     Int
  orderId    Int       @unique  // 1 order chỉ dùng 1 coupon
  usedAt     DateTime @default(now())

  // relations
  coupon     Coupon   @relation(fields: [couponId], references: [id])
  user       User     @relation(fields: [userId], references: [id])
  order      Order    @relation(fields: [orderId], references: [id])

  @@index([couponId])
  @@index([userId, couponId])
}
```

### 4.3 Cập nhật model `Order`

```prisma
model Order {
  id              Int       @id @default(autoincrement())
  studentId       Int
  couponId        Int?      // ← MỚI: FK tới Coupon
  couponCode      String?   // ← MỚI: Lưu code để dễ tra cứu (denormalized)
  discountAmount  Float?    @default(0)  // ← MỚI: Số tiền đã giảm
  originalPrice   Float?    // ← MỚI: Giá trước khi giảm
  totalPrice      Float?    @default(0) // Giá sau khi giảm
  paymentMethod   String?   @default("payos")
  status          String?   @default("pending")
  paymentLinkId   String?   @unique
  paymentStatus   String?   @default("pending")
  checkoutUrl     String?   @db.Text
  qrCode          String?   @db.Text
  isSuccess       Boolean   @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime? @updatedAt
  isDestroyed     Boolean   @default(false)

  // relations
  student         User         @relation(fields: [studentId], references: [id])
  coupon          Coupon?      @relation(fields: [couponId], references: [id])
  items           OrderItem[]
  revenue         Revenue?
  couponUsage     CouponUsage? // ← MỚI
}
```

---

## 5. Hướng dẫn thực hiện từng bước

### Bước 1: Cập nhật Prisma Schema

**File**: `prisma/schema.prisma`

Thêm các trường mới vào `Coupon`:
```prisma
scope         String    @default("ALL_COURSES")
scopeCategoryId Int?
usedCount     Int       @default(0)
usagePerUser  Int?
```

Thêm trường mới vào `Order`:
```prisma
couponId        Int?
couponCode      String?
discountAmount  Float?    @default(0)
originalPrice   Float?
```

Tạo model `CouponUsage`.

Thêm relation `couponUsage CouponUsage?` vào `User`.

Chạy migration:
```bash
npx prisma migrate dev --name add_voucher_usage_tracking
npx prisma generate
```

---

### Bước 2: Tạo hàm `applyCouponToOrder` trong `couponService.ts`

```typescript
/**
 * Kiểm tra coupon có hợp lệ và tính toán giảm giá cho order
 * @returns couponInfo, discountAmount, eligibleItemIds
 */
const applyCouponToOrder = async ({
  couponCode,
  studentId,
  items, // [{ courseId, price, categoryId? }]
  originalTotal,
}: {
  couponCode: string;
  studentId: number;
  items: Array<{ courseId: number; price: number; courseCategoryId?: number | null }>;
  originalTotal: number;
}) => {
  // 1. Tìm coupon
  const coupon = await prisma.coupon.findUnique({
    where: { code: couponCode, isDestroyed: false },
    include: { course: { select: { id: true } } },
  });

  if (!coupon) throw new ApiError(StatusCodes.NOT_FOUND, "Coupon not found!");

  // 2. Check status
  if (coupon.status !== "active") {
    throw new ApiError(StatusCodes.BAD_REQUEST, `Coupon is ${coupon.status}!`);
  }

  // 3. Check thời hạn
  const now = new Date();
  if (coupon.startingDate && new Date(coupon.startingDate) > now) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Coupon is not yet available!");
  }
  if (coupon.endingDate && new Date(coupon.endingDate) < now) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Coupon has expired!");
  }

  // 4. Check usageLimit
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Coupon has reached its usage limit!");
  }

  // 5. Check usagePerUser (số lần user này đã dùng)
  if (coupon.usagePerUser !== null) {
    const userUsageCount = await prisma.couponUsage.count({
      where: { couponId: coupon.id, userId: studentId },
    });
    if (userUsageCount >= coupon.usagePerUser) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "You have reached the usage limit for this coupon!"
      );
    }
  }

  // 6. Lọc items eligible theo scope
  let eligibleItems = items;
  
  if (coupon.scope === "SPECIFIC_COURSE") {
    eligibleItems = items.filter((item) => item.courseId === coupon.courseId);
    if (eligibleItems.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "This coupon is only applicable to a specific course not in your order!"
      );
    }
  } else if (coupon.scope === "CATEGORY") {
    eligibleItems = items.filter(
      (item) => item.courseCategoryId === coupon.scopeCategoryId
    );
    if (eligibleItems.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "No items in your order qualify for this coupon!"
      );
    }
  }

  const eligibleTotal = eligibleItems.reduce((sum, item) => sum + item.price, 0);

  // 7. Check minOrderValue (so với phần eligible)
  if (coupon.minOrderValue && eligibleTotal < coupon.minOrderValue) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Minimum order value for this coupon is ${coupon.minOrderValue.toLocaleString()}đ!`
    );
  }

  // 8. Tính discount
  let discountAmount = 0;
  if (coupon.discountUnit === "percent") {
    discountAmount = (eligibleTotal * (coupon.discount || 0)) / 100;
    if (coupon.maxValue !== null && coupon.maxValue !== undefined) {
      discountAmount = Math.min(discountAmount, coupon.maxValue);
    }
  } else {
    // amount
    discountAmount = Math.min(coupon.amount || coupon.discount || 0, eligibleTotal);
  }

  discountAmount = Number(discountAmount.toFixed(2));

  return {
    coupon,
    discountAmount,
    eligibleItemIds: eligibleItems.map((i) => i.courseId),
  };
};
```

---

### Bước 3: Cập nhật `createOrder` trong `orderService.ts`

```typescript
const createOrder = async (data: {
  studentId: number;
  paymentMethod?: string;
  couponCode?: string;
  items?: Array<{ courseId: number; quantity: number; price: number }>;
}) => {
  // ... (giữ nguyên logic lấy items) ...

  // Tổng giá gốc
  const originalTotal = itemsToOrder.reduce((sum, item) => sum + item.price, 0);
  let totalPrice = originalTotal;
  let discountAmount = 0;
  let appliedCouponId: number | null = null;
  let appliedCouponCode: string | null = null;

  // Áp dụng coupon NẾU có
  if (data.couponCode) {
    // Lấy categoryId của từng course để check scope
    const itemsWithCategory = await Promise.all(
      itemsToOrder.map(async (item) => {
        const course = await prisma.course.findUnique({
          where: { id: item.courseId },
          select: { categoryId: true },
        });
        return { ...item, courseCategoryId: course?.categoryId };
      })
    );

    const couponResult = await couponService.applyCouponToOrder({
      couponCode: data.couponCode,
      studentId: data.studentId,
      items: itemsWithCategory,
      originalTotal,
    });

    discountAmount = couponResult.discountAmount;
    totalPrice = Math.max(0, originalTotal - discountAmount);
    appliedCouponId = couponResult.coupon.id;
    appliedCouponCode = data.couponCode;
  }

  // Tạo order với đầy đủ thông tin coupon
  const newOrder = await prisma.order.create({
    data: {
      studentId: data.studentId,
      originalPrice: originalTotal,
      totalPrice,
      discountAmount,
      couponId: appliedCouponId,
      couponCode: appliedCouponCode,
      paymentMethod: data.paymentMethod?.toUpperCase() || "PAYOS",
      status: "pending",
      paymentStatus: "pending",
      isSuccess: false,
      items: {
        create: itemsToOrder.map((item) => ({
          courseId: item.courseId,
          price: item.price,
          lecturerId: item.lecturerId ?? null,
        })),
      },
    },
    include: { items: { include: { course: true } }, student: true },
  });

  return newOrder;
};
```

---

### Bước 4: Ghi nhận CouponUsage khi thanh toán thành công

Trong `payosService.ts` (hoặc nơi xử lý webhook thanh toán thành công):

```typescript
// Khi order được xác nhận thanh toán thành công
const handlePaymentSuccess = async (orderId: number) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { coupon: true },
  });

  if (order?.couponId && order.couponCode) {
    await prisma.$transaction([
      // Ghi nhận lịch sử dùng
      prisma.couponUsage.create({
        data: {
          couponId: order.couponId,
          userId: order.studentId,
          orderId: order.id,
        },
      }),
      // Tăng usedCount
      prisma.coupon.update({
        where: { id: order.couponId },
        data: { usedCount: { increment: 1 } },
      }),
    ]);
  }
};
```

---

### Bước 5: Hoàn trả coupon khi order bị hủy

Trong `orderService.ts` - hàm `cancelOrder`:

```typescript
const cancelOrder = async (orderId: number) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId, isDestroyed: false },
    include: { couponUsage: true },
  });

  if (!order) throw new ApiError(StatusCodes.NOT_FOUND, "Order not found!");
  if (order.status !== "pending") {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Only pending orders can be cancelled.");
  }

  await prisma.$transaction(async (tx) => {
    // Hủy order
    await tx.order.update({
      where: { id: orderId },
      data: { status: "cancelled" },
    });

    // Hoàn trả coupon nếu đã ghi nhận usage
    if (order.couponId && order.couponUsage) {
      await tx.couponUsage.delete({
        where: { orderId },
      });
      await tx.coupon.update({
        where: { id: order.couponId },
        data: { usedCount: { decrement: 1 } },
      });
    }
  });

  return { message: "Order cancelled successfully!" };
};
```

---

### Bước 6: API preview giảm giá (Preview Coupon)

Thêm endpoint cho phép user preview discount TRƯỚC khi tạo order:

**Controller** (`couponController.ts`):
```typescript
const previewCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, courseIds } = req.body;
    const studentId = req.user.id; // From auth middleware

    // Lấy giá của từng course
    const courses = await prisma.course.findMany({
      where: { id: { in: courseIds }, isDestroyed: false },
      select: { id: true, price: true, categoryId: true },
    });

    const items = courses.map((c) => ({
      courseId: c.id,
      price: c.price,
      courseCategoryId: c.categoryId,
    }));

    const originalTotal = items.reduce((sum, i) => sum + i.price, 0);

    const result = await couponService.applyCouponToOrder({
      couponCode: code,
      studentId,
      items,
      originalTotal,
    });

    res.status(StatusCodes.OK).json({
      couponCode: code,
      discountAmount: result.discountAmount,
      originalTotal,
      finalTotal: originalTotal - result.discountAmount,
      eligibleCourseIds: result.eligibleItemIds,
      coupon: {
        name: result.coupon.name,
        discountUnit: result.coupon.discountUnit,
        discount: result.coupon.discount,
      },
    });
  } catch (error) {
    next(error);
  }
};
```

---

### Bước 7: Cập nhật `getAllCoupons` — thêm thông tin thống kê

```typescript
const getAllCoupons = async (filters: { ... }) => {
  const coupons = await prisma.coupon.findMany({
    ...
    include: {
      category: true,
      _count: { select: { usages: true } },  // Đếm số lần dùng thực tế
    },
  });

  return {
    data: coupons.map((coupon) => ({
      ...normalizeCouponResponse(coupon),
      redemptions: coupon._count.usages,   // Số lần đã dùng
      remainingUsages: coupon.usageLimit   // Số lần còn lại
        ? coupon.usageLimit - coupon.usedCount
        : null,
    })),
    pagination: { ... },
  };
};
```

---

## 6. API Endpoints

### Coupon Management (Admin)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/api/v1/coupons` | Tạo coupon mới |
| `GET` | `/api/v1/coupons` | Danh sách coupon (admin) |
| `GET` | `/api/v1/coupons/:id` | Chi tiết coupon |
| `PUT` | `/api/v1/coupons/:id` | Cập nhật coupon |
| `DELETE` | `/api/v1/coupons/:id` | Xóa coupon |
| `GET` | `/api/v1/coupons/:id/usages` | Lịch sử dùng coupon |

### Coupon Application (Student)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/api/v1/coupons/verify` | Xác minh coupon (check hợp lệ) |
| `POST` | `/api/v1/coupons/preview` | Preview số tiền giảm (truyền courseIds) |

### Order với Coupon (Student)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/api/v1/orders` | Tạo order (body có thể có `couponCode`) |

### Request Body - Tạo Order với Coupon

```json
{
  "studentId": 1,
  "paymentMethod": "payos",
  "couponCode": "SUMMER20",
  "items": [
    { "courseId": 5, "price": 299000 },
    { "courseId": 8, "price": 499000 }
  ]
}
```

### Response - Tạo Order

```json
{
  "id": 123,
  "studentId": 1,
  "originalPrice": 798000,
  "discountAmount": 159600,
  "totalPrice": 638400,
  "couponCode": "SUMMER20",
  "couponId": 3,
  "status": "pending",
  "paymentStatus": "pending",
  "items": [ ... ]
}
```

### Request Body - Preview Coupon

```json
{
  "code": "SUMMER20",
  "courseIds": [5, 8]
}
```

### Response - Preview Coupon

```json
{
  "couponCode": "SUMMER20",
  "discountAmount": 159600,
  "originalTotal": 798000,
  "finalTotal": 638400,
  "eligibleCourseIds": [5, 8],
  "coupon": {
    "name": "Summer Sale 20%",
    "discountUnit": "percent",
    "discount": 20
  }
}
```

---

## 7. Luồng xử lý tổng thể

```
[Student] → Thêm khóa học vào Cart
    ↓
[Student] → Nhập mã voucher trên UI
    ↓
[Frontend] → POST /coupons/preview { code, courseIds }
    ↓
[Backend couponService.applyCouponToOrder()] →
    ✅ Check status, ngày, usageLimit, usagePerUser
    ✅ Lọc items eligible theo scope
    ✅ Check minOrderValue
    ✅ Tính discountAmount
    ↓
[Frontend] → Hiển thị preview: originalTotal, discountAmount, finalTotal
    ↓
[Student] → Xác nhận đặt hàng
    ↓
[Frontend] → POST /orders { studentId, couponCode, items }
    ↓
[Backend orderService.createOrder()] →
    ✅ Gọi lại applyCouponToOrder() để validate lần cuối
    ✅ Lưu order với: originalPrice, discountAmount, totalPrice, couponId, couponCode
    ↓
[Backend] → Tạo PayOS payment link
    ↓
[Student] → Thanh toán qua PayOS
    ↓
[PayOS Webhook] → Callback thành công
    ↓
[Backend payosService.handleWebhook()] →
    ✅ Cập nhật order.paymentStatus = "paid"
    ✅ Tạo CouponUsage record
    ✅ Tăng coupon.usedCount
    ✅ Tạo Enrollment cho từng course
    ↓
[Student] → Có quyền truy cập khóa học

─────────────────────────────────────────────

Nếu order bị hủy / thanh toán thất bại:
    ↓
[Backend cancelOrder()] →
    ✅ status = "cancelled"
    ✅ Xóa CouponUsage (nếu đã tạo)
    ✅ Giảm coupon.usedCount (nếu đã tăng)
```

---

## 8. Checklist thực hiện

- [ ] **Schema**: Thêm `usedCount`, `usagePerUser`, `scope`, `scopeCategoryId` vào `Coupon`
- [ ] **Schema**: Thêm `couponId`, `couponCode`, `discountAmount`, `originalPrice` vào `Order`
- [ ] **Schema**: Tạo model `CouponUsage`
- [ ] **Schema**: Thêm relation `couponUsage CouponUsage?` vào `User`
- [ ] **Migration**: Chạy `prisma migrate dev`
- [ ] **couponService**: Tạo hàm `applyCouponToOrder()`
- [ ] **couponService**: Cập nhật `getAllCoupons()` — thêm `redemptions`, `remainingUsages`
- [ ] **couponService**: Sửa `verifyCouponCode()` — thêm param `orderTotal?` để check `minOrderValue`
- [ ] **couponController**: Thêm `previewCoupon` endpoint
- [ ] **orderService**: Cập nhật `createOrder()` — dùng `applyCouponToOrder()`
- [ ] **orderService**: Cập nhật `cancelOrder()` — hoàn trả coupon
- [ ] **payosService**: Ghi nhận `CouponUsage` khi thanh toán thành công
- [ ] **routes**: Thêm route `POST /coupons/preview`
- [ ] **Test**: Viết test cases cho các scenarios

---

## 9. Test Scenarios

| Scenario | Expected |
|----------|----------|
| Coupon hợp lệ, đủ điều kiện | Áp dụng thành công, trả về finalTotal |
| Coupon không tồn tại | 404 Not Found |
| Coupon hết hạn (`endingDate` < now) | 400 Coupon has expired |
| Coupon chưa bắt đầu | 400 Coupon is not yet available |
| Coupon hết lượt (`usedCount >= usageLimit`) | 400 Coupon has reached its usage limit |
| User đã dùng quá `usagePerUser` lần | 400 You have reached the usage limit |
| Tổng đơn < `minOrderValue` | 400 Minimum order value is... |
| Scope = SPECIFIC_COURSE, course không trong order | 400 Coupon not applicable |
| Scope = CATEGORY, không có course nào thuộc category | 400 No items qualify |
| Hủy order đã dùng coupon | usedCount giảm đi 1, CouponUsage bị xóa |
| Thanh toán thành công | CouponUsage được tạo, usedCount tăng |

---

*Tài liệu này được tạo bởi Antigravity AI Assistant — 2026-04-04*
