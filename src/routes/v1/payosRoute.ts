import { payosController } from "@/controllers/payosController.js";
import { payosValidation } from "@/validations/payosValidation.js";
import express from "express";

const Router = express.Router();

/**
 * GIAI ĐOẠN 2: Tạo Link Thanh Toán
 * POST /api/payos/create-payment
 * Khách hàng gửi orderId để lấy link thanh toán
 */
Router.route("/create-payment").post(
  payosValidation.createPaymentLink,
  payosController.createPaymentLink,
);

/**
 * GIAI ĐOẠN 4: Webhook từ PayOS
 * POST /api/payos/webhook
 * Endpoint này được PayOS gọi tự động sau khi có giao dịch
 * KHÔNG CẦN AUTHENTICATION - vì PayOS call từ backend của họ
 * PHẢI verify signature để bảo mật
 */
Router.route("/webhook").post(payosController.handleWebhook);

/**
 * GIAI ĐOẠN 5: Check Payment Status (Optional)
 * GET /api/payos/check-status/:orderId
 * Khách hàng check lại trạng thái nếu webhook bị trễ
 */
Router.route("/check-status/:orderId").get(
  payosValidation.checkPaymentStatus,
  payosController.checkPaymentStatus,
);

/**
 * Cancel Payment
 * PUT /api/payos/cancel/:orderId
 * Hủy link thanh toán nếu người dùng không muốn thanh toán nữa
 */
Router.route("/cancel/:orderId").put(
  payosValidation.cancelPayment,
  payosController.cancelPayment,
);

/**
 * Reconcile pending payments
 * POST /api/payos/reconcile-pending
 * Manual backfill for orders that are pending locally but PAID on PayOS
 */
Router.route("/reconcile-pending").post(
  payosValidation.reconcilePendingPayments,
  payosController.reconcilePendingPayments,
);

export const payosRoute = Router;
