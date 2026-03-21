import { payosService } from "@/services/payosService.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

/**
 * GIAI ĐOẠN 2: Tạo Link Thanh Toán
 * Client: POST /api/payos/create-payment
 * Body: { orderId: number, returnUrl?: string, cancelUrl?: string }
 * Response: { checkoutUrl, qrCode, paymentLinkId }
 */
const createPaymentLink = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await payosService.createPaymentLink(req.body);
    res.status(StatusCodes.CREATED).json({
      message: "Payment link created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GIAI ĐOẠN 4: Webhook từ PayOS (KHÔNG CẦN AUTHENTICATION)
 * PayOS: POST /api/payos/webhook
 * Xác thực chữ ký + cập nhật đơn hàng
 *
 * MỌI NGƯỜI đều có thể call endpoint này, nhưng chỉ webhook từ PayOS
 * với signature hợp lệ mới được xử lý
 */
const handleWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log("📨 Webhook received from PayOS:", req.body);

    const result = await payosService.handleWebhook(req.body);

    // **Quan trọng**: Phải trả về HTTP 200 OK để PayOS biết webhook đã được xử lý thành công
    // Nếu không trả 200, PayOS sẽ thử gửi lại webhook nhiều lần
    res.status(StatusCodes.OK).json({
      message: "Webhook processed successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("❌ Webhook error:", error);

    // Vẫn trả 200 để PayOS không gửi lại, nhưng log lỗi
    res.status(StatusCodes.OK).json({
      message: "Webhook received but processing failed",
      error: error.message,
    });
  }
};

/**
 * GIAI ĐOẠN 5: Check Payment Status (Optional Fallback)
 * Client: GET /api/payos/check-status/:orderId
 * Kiểm tra trạng thái thanh toán từ PayOS
 */
const checkPaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = req.params;

    const result = await payosService.checkPaymentStatus(Number(orderId));

    res.status(StatusCodes.OK).json({
      message: "Payment status retrieved",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel Payment Link
 * Client: PUT /api/payos/cancel/:orderId
 */
const cancelPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = req.params;

    const result = await payosService.cancelPayment(Number(orderId));

    res.status(StatusCodes.OK).json({
      message: "Payment cancelled",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const payosController = {
  createPaymentLink,
  handleWebhook,
  checkPaymentStatus,
  cancelPayment,
};
