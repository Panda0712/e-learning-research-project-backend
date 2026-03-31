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
export type OrderStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";
/**
 * PayOS Payment Link Response
 * Trả về khi tạo link thanh toán thành công
 */
export interface PaymentLinkResponse {
    paymentLinkId: string;
    checkoutUrl: string;
    qrCode: string;
    createDate: string;
    expiresAt?: string;
}
/**
 * PayOS Webhook Data
 * Dữ liệu PayOS gửi khi có transaction
 */
export interface PayosWebhookData {
    code: string;
    desc: string;
    data: {
        orderCode: number;
        orderCodeV2?: string;
        amount: number;
        amountPaid: number;
        amountRemaining?: number;
        transactionDateTime: string;
        status: string;
        createdAt: string;
        canceledAt?: string;
    };
    signature: string;
}
/**
 * Create Payment Link Request
 */
export interface CreatePaymentLinkRequest {
    orderId: number;
    returnUrl?: string;
    cancelUrl?: string;
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
//# sourceMappingURL=payos.type.d.ts.map