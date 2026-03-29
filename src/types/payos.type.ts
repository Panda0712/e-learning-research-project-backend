/**
 * PaymentStatus
 * - pending: Chưa thanh toán
 * - paid: Đã thanh toán thành công
 * - cancelled: Bị hủy
 * - failed: Thanh toán thất bại
 */
export type PaymentStatus = "pending" | "paid" | "cancelled" | "failed";

/**
 * OrderStatus
 * - pending: Order vừa tạo, chờ thanh toán
 * - processing: Đã thanh toán, đang xử lý
 * - completed: Hoàn tất
 * - failed: Thất bại
 * - cancelled: Bị hủy
 */
export type OrderStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

/**
 * PayOS Payment Link Response
 * Trả về khi tạo link thanh toán thành công
 */
export interface PaymentLinkResponse {
  paymentLinkId: string;
  checkoutUrl: string; // Link customer sẽ được redirect tới
  qrCode: string; // QR code image (base64)
  createDate: string;
  expiresAt?: string;
}

/**
 * PayOS Webhook Data
 * Dữ liệu PayOS gửi khi có transaction
 */
export interface PayosWebhookData {
  code: string; // "00" = success
  desc: string; // "success" hoặc mô tả lỗi
  data: {
    orderCode: number; // ID của order
    orderCodeV2?: string; // PayOS internal order ID
    amount: number; // Số tiền
    amountPaid: number; // Số tiền đã trả
    amountRemaining?: number; // Số tiền còn lại
    transactionDateTime: string;
    status: string; // "PAID", "PROCESSING", "CANCELLED", "FAILED"
    createdAt: string;
    canceledAt?: string;
  };
  signature: string; // HMAC signature để verify
}

/**
 * Create Payment Link Request
 */
export interface CreatePaymentLinkRequest {
  orderId: number;
  returnUrl?: string; // Redirect URL sau khi thanh toán
  cancelUrl?: string; // Redirect URL nếu hủy
}

/**
 * Create Payment Link Response
 */
export interface CreatePaymentLinkApiResponse {
  message: string;
  data: {
    orderId: number;
    paymentLinkId: string;
    checkoutUrl: string;
    qrCode: string;
    amount: number;
  };
}

/**
 * Webhook Handler Response
 */
export interface WebhookHandlerResponse {
  success: boolean;
  message: string;
  orderId?: number;
  status?: string;
}

/**
 * Payment Status Check Response
 */
export interface PaymentStatusCheckResponse {
  orderId: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  isSuccess: boolean;
  totalPrice: number;
}

/**
 * Cancel Payment Response
 */
export interface CancelPaymentResponse {
  orderId: number;
  message: string;
  status: string;
}

/**
 * Order with Payment Info
 */
export interface OrderWithPayment {
  id: number;
  studentId: number;
  totalPrice: number;
  paymentMethod: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentLinkId?: string;
  checkoutUrl?: string;
  qrCode?: string;
  isSuccess: boolean;
  createdAt: Date;
  updatedAt: Date;
}
