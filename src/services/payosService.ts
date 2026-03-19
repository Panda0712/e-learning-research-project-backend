import { env } from "@/configs/environment.js";
import { prisma } from "@/lib/prisma.js";
import { PayosProvider } from "@/providers/PayosProvider.js";
import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { enrollmentService } from "./enrollmentService.js";

/**
 * GIAI ĐOẠN 2: Tạo link thanh toán (Payment Link Creation)
 * Khách hàng gửi yêu cầu lấy link thanh toán từ OrderId
 */
const createPaymentLink = async (data: {
  orderId: number;
  returnUrl?: string;
  cancelUrl?: string;
}) => {
  try {
    const { orderId } = data;

    // Lấy thông tin đơn hàng từ database
    const order = await prisma.order.findUnique({
      where: { id: orderId, isDestroyed: false },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
        items: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Order not found!");
    }

    // Kiểm tra phương thức thanh toán là PayOS
    if (order.paymentMethod?.toUpperCase() !== "PAYOS") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "This order is not set for PayOS payment!",
      );
    }

    // Kiểm tra đơn hàng chưa thanh toán
    if (order.paymentStatus === "paid") {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "This order has already been paid!",
      );
    }

    // Chuẩn bị dữ liệu thanh toán
    const orderDescription = `Payment for courses: ${order.items.map((item) => item.course.name).join(", ")}`;

    const returnUrl = data.returnUrl || env.PAYOS_RETURN_URL;
    const cancelUrl = data.cancelUrl || env.PAYOS_CANCEL_URL;

    // Gọi PayOS để tạo link thanh toán
    const paymentLinkData: any = {
      orderCode: order.id,
      amount: Math.round(order.totalPrice || 0),
      description: orderDescription,
      buyerName:
        `${order.student.firstName || ""} ${order.student.lastName || ""}`.trim(),
      buyerEmail: order.student.email,
      cancelUrl: cancelUrl!,
      returnUrl: returnUrl!,
    };

    // Only add buyerPhone if exists (handle optional field)
    if (order.student.phoneNumber) {
      paymentLinkData.buyerPhone = order.student.phoneNumber;
    }

    const paymentLinkResponse =
      await PayosProvider.createPaymentLink(paymentLinkData);

    // **Quan trọng**: Lưu paymentLinkId vào database cho việc tra cứu sau này
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentLinkId: paymentLinkResponse.paymentLinkId,
        checkoutUrl: paymentLinkResponse.checkoutUrl,
        qrCode: paymentLinkResponse.qrCode,
        paymentStatus: "pending",
        updatedAt: new Date(),
      },
    });

    return {
      orderId: updatedOrder.id,
      paymentLinkId: paymentLinkResponse.paymentLinkId,
      checkoutUrl: paymentLinkResponse.checkoutUrl,
      qrCode: paymentLinkResponse.qrCode,
      amount: order.totalPrice,
    };
  } catch (error: any) {
    throw error;
  }
};

/**
 * GIAI ĐOẠN 4: Xử lý Webhook từ PayOS
 * Đây là bước quan trọng nhất - PayOS gửi webhook để xác nhận trạng thái thanh toán
 */
const handleWebhook = async (webhookBody: any) => {
  try {
    // Bước 1: Xác thực chữ ký (Signature Verification) - CỰC KỲ QUAN TRỌNG để bảo mật
    const isValidSignature = PayosProvider.verifyWebhookSignature(webhookBody);

    if (!isValidSignature) {
      console.error("❌ Webhook signature verification failed!");
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Invalid webhook signature - possible forgery attempt!",
      );
    }

    // Bước 2: Kiểm tra trạng thái giao dịch (code == "00" = thành công)
    const webhookData = PayosProvider.extractWebhookData(webhookBody);

    if (!webhookData) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Invalid webhook data format!",
      );
    }

    const orderCode = webhookData.data.orderCode;
    const transactionStatus = webhookData.data.status;
    const isSuccessful =
      webhookData.code === "00" && transactionStatus === "PAID";

    // Bước 3: Cập nhật đơn hàng trong database
    const order = await prisma.order.findUnique({
      where: { id: orderCode, isDestroyed: false },
      include: {
        items: {
          select: { courseId: true },
        },
      },
    });

    if (!order) {
      console.error(`❌ Order not found: ${orderCode}`);
      throw new ApiError(StatusCodes.NOT_FOUND, "Order not found!");
    }

    if (isSuccessful) {
      // Thanh toán thành công
      const updatedOrder = await prisma.$transaction(async (tx) => {
        // Cập nhật trạng thái đơn hàng
        const updated = await tx.order.update({
          where: { id: orderCode },
          data: {
            paymentStatus: "paid",
            status: "processing", // Đơn hàng đang được xử lý
            isSuccess: true,
            updatedAt: new Date(),
          },
        });

        // Tự động tạo enrollment cho học sinh với tất cả các khóa học trong đơn hàng
        for (const item of order.items) {
          try {
            await enrollmentService.createEnrollment({
              studentId: order.studentId,
              courseId: item.courseId,
            });
          } catch (error: any) {
            console.error(`Failed to create enrollment:`, error);
          }
        }

        return updated;
      });

      console.log(`✅ Order ${orderCode} payment successful!`);

      return {
        success: true,
        message: "Payment confirmed, order processed successfully",
        orderId: updatedOrder.id,
        status: updatedOrder.status,
      };
    } else {
      // Thanh toán thất bại
      await prisma.order.update({
        where: { id: orderCode },
        data: {
          paymentStatus: "failed",
          status: "failed",
          isSuccess: false,
          updatedAt: new Date(),
        },
      });

      console.log(`❌ Payment failed for order ${orderCode}`);

      return {
        success: false,
        message: "Payment failed",
        orderId: orderCode,
      };
    }
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    throw error;
  }
};

/**
 * GIAI ĐOẠN 5: Kiểm tra trạng thái thanh toán (Optional Fallback)
 * Client có thể gọi endpoint này để kiểm tra lại trạng thái thanh toán
 * Nếu webhook bị trễ, đây là cơ chế dự phòng
 */
const checkPaymentStatus = async (orderId: number) => {
  try {
    // Lấy thông tin đơn hàng hiện tại
    const order = await prisma.order.findUnique({
      where: { id: orderId, isDestroyed: false },
    });

    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Order not found!");
    }

    // Nếu chưa có paymentLinkId, không thể check
    if (!order.paymentLinkId) {
      return {
        orderId: order.id,
        status: order.paymentStatus,
        note: "No payment link found",
      };
    }

    // Gọi trực tiếp đến PayOS để lấy trạng thái mới nhất
    const latestPaymentInfo = await PayosProvider.getPaymentLinkInfo(order.id);

    // Nếu PayOS trả về status PAID nhưng database còn pending, cập nhật
    if (latestPaymentInfo.status === "PAID" && order.paymentStatus !== "paid") {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "paid",
          status: "processing",
          isSuccess: true,
          updatedAt: new Date(),
        },
      });

      // Tạo enrollment nếu chưa tạo
      const orderWithItems = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: { select: { courseId: true } },
        },
      });

      if (orderWithItems) {
        for (const item of orderWithItems.items) {
          try {
            await enrollmentService.createEnrollment({
              studentId: order.studentId,
              courseId: item.courseId,
            });
          } catch (error) {
            console.error("Enrollment creation error:", error);
          }
        }
      }
    }

    const updatedOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    return {
      orderId: updatedOrder?.id,
      paymentStatus: updatedOrder?.paymentStatus,
      orderStatus: updatedOrder?.status,
      isSuccess: updatedOrder?.isSuccess,
      totalPrice: updatedOrder?.totalPrice,
    };
  } catch (error: any) {
    throw error;
  }
};

/**
 * Cancel payment link nếu người dùng không muốn thanh toán nữa
 */
const cancelPayment = async (orderId: number) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId, isDestroyed: false },
    });

    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Order not found!");
    }

    if (order.paymentStatus === "paid") {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Cannot cancel a paid order payment!",
      );
    }

    if (!order.paymentLinkId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "No payment link to cancel!");
    }

    // Gọi PayOS để cancel link
    await PayosProvider.cancelPaymentLink(order.id);

    // Cập nhật status trong database
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "cancelled",
        status: "cancelled",
        updatedAt: new Date(),
      },
    });

    return {
      orderId: updatedOrder.id,
      message: "Payment link cancelled successfully",
      status: updatedOrder.status,
    };
  } catch (error: any) {
    throw error;
  }
};

export const payosService = {
  createPaymentLink,
  handleWebhook,
  checkPaymentStatus,
  cancelPayment,
};
