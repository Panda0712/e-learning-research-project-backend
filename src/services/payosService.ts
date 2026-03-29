import { env } from "@/configs/environment.js";
import { prisma } from "@/lib/prisma.js";
import { PayosProvider } from "@/providers/PayosProvider.js";
import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const ensureTransactionRecords = async ({
  db,
  orderId,
  studentId,
  totalPrice,
  courseItems,
  paymentTimestamp,
}: {
  db: any;
  orderId: number;
  studentId: number;
  totalPrice: number;
  courseItems: Array<{ courseId: number }>;
  paymentTimestamp?: Date;
}) => {
  const gatewayReference = `PAYOS_ORDER_${orderId}`;

  let transactionRecord = await db.transaction.findFirst({
    where: {
      gatewayReference,
      userId: studentId,
      isDestroyed: false,
    },
    select: { id: true, createdAt: true },
  });

  if (!transactionRecord) {
    const transactionCreateData: any = {
      userId: studentId,
      userRole: "student",
      amount: Number(totalPrice || 0),
      paymentMethod: "payos",
      status: "success",
      gatewayReference,
    };

    if (paymentTimestamp) {
      transactionCreateData.createdAt = paymentTimestamp;
    }

    transactionRecord = await db.transaction.create({
      data: transactionCreateData,
      select: { id: true, createdAt: true },
    });
  } else if (paymentTimestamp) {
    const currentCreatedAt = new Date(transactionRecord.createdAt);

    if (
      Math.abs(currentCreatedAt.getTime() - paymentTimestamp.getTime()) > 1000
    ) {
      await db.transaction.update({
        where: { id: transactionRecord.id },
        data: { createdAt: paymentTimestamp },
      });
    }
  }

  if (courseItems.length > 0) {
    const targetCourseIds = [
      ...new Set(courseItems.map((item) => item.courseId)),
    ];

    const existingOrderCourseRows = await db.transactionStudent.findMany({
      where: {
        orderId,
        courseId: { in: targetCourseIds },
        isDestroyed: false,
      },
      select: { courseId: true },
    });

    const existingCourseIdSet = new Set(
      existingOrderCourseRows
        .map((row: { courseId: number | null }) => row.courseId)
        .filter(
          (courseId: number | null): courseId is number => courseId !== null,
        ),
    );

    const missingCourseIds = targetCourseIds.filter(
      (courseId) => !existingCourseIdSet.has(courseId),
    );

    if (missingCourseIds.length === 0) return;

    await db.transactionStudent.createMany({
      data: missingCourseIds.map((courseId) => ({
        transactionId: transactionRecord.id,
        orderId,
        courseId,
        isDiscount: false,
        discountAmount: 0,
        ...(paymentTimestamp ? { createdAt: paymentTimestamp } : {}),
      })),
    });
  }
};

const parsePayosDateTime = (value?: string): Date | undefined => {
  if (!value || typeof value !== "string") return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(trimmed);
  const normalized = trimmed.includes(" ")
    ? trimmed.replace(" ", "T")
    : trimmed;

  const candidate = hasTimezone ? normalized : `${normalized}+07:00`;
  const parsed = new Date(candidate);

  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const extractPaymentTimestamp = (source: any): Date | undefined => {
  const root = parsePayosDateTime(source?.transactionDateTime);
  if (root) return root;

  if (Array.isArray(source?.transactions) && source.transactions.length > 0) {
    for (const item of source.transactions) {
      const parsed = parsePayosDateTime(item?.transactionDateTime);
      if (parsed) return parsed;
    }
  }

  return undefined;
};

const ensureEnrollments = async ({
  db,
  studentId,
  courseItems,
}: {
  db: any;
  studentId: number;
  courseItems: Array<{ courseId: number }>;
}) => {
  if (courseItems.length === 0) return;

  const targetCourseIds = [
    ...new Set(courseItems.map((item) => item.courseId)),
  ];

  const existingEnrollments = await db.enrollment.findMany({
    where: {
      studentId,
      courseId: { in: targetCourseIds },
      isDestroyed: false,
    },
    select: { courseId: true },
  });

  const existingCourseIdSet = new Set(
    existingEnrollments.map((item: { courseId: number }) => item.courseId),
  );
  const missingCourseIds = targetCourseIds.filter(
    (courseId) => !existingCourseIdSet.has(courseId),
  );

  if (missingCourseIds.length === 0) return;

  await db.enrollment.createMany({
    data: missingCourseIds.map((courseId) => ({
      studentId,
      courseId,
      status: "enrolled",
      progress: 0,
    })),
  });
};

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

    // PayOS giới hạn description tối đa 25 ký tự.
    const orderDescription = `Order ${order.id} course payment`;

    const returnUrl = data.returnUrl || env.PAYOS_RETURN_URL;
    const cancelUrl = data.cancelUrl || env.PAYOS_CANCEL_URL;

    if (!returnUrl || !cancelUrl) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "PayOS return/cancel URLs are not configured!",
      );
    }

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

    let paymentLinkResponse: any;

    try {
      paymentLinkResponse =
        await PayosProvider.createPaymentLink(paymentLinkData);
    } catch (error: any) {
      // Code 231: orderCode đã tồn tại trên PayOS. Lấy lại link hiện có để tránh fail flow.
      if (String(error?.message || "").includes("code: 231")) {
        const existingPaymentInfo: any = await PayosProvider.getPaymentLinkInfo(
          order.id,
        );
        paymentLinkResponse = {
          paymentLinkId:
            existingPaymentInfo.paymentLinkId || existingPaymentInfo.id || null,
          checkoutUrl: existingPaymentInfo.checkoutUrl || null,
          qrCode: existingPaymentInfo.qrCode || null,
        };
      } else {
        throw error;
      }
    }

    if (!paymentLinkResponse?.checkoutUrl) {
      throw new ApiError(
        StatusCodes.BAD_GATEWAY,
        "PayOS did not return a valid checkout URL",
      );
    }

    // **Quan trọng**: Lưu paymentLinkId vào database cho việc tra cứu sau này
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentLinkId:
          paymentLinkResponse.paymentLinkId || order.paymentLinkId || null,
        checkoutUrl: paymentLinkResponse.checkoutUrl,
        qrCode: paymentLinkResponse.qrCode || null,
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
    const paymentTimestamp = extractPaymentTimestamp(webhookData.data);
    const isSuccessful =
      webhookData.code === "00" && transactionStatus === "PAID";

    // Bước 3: Cập nhật đơn hàng trong database
    const order = await prisma.order.findUnique({
      where: { id: orderCode, isDestroyed: false },
      include: {
        items: {
          select: {
            courseId: true,
            price: true,
            lecturerId: true,
            course: {
              select: { lecturerId: true },
            },
          },
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

        // Ghi nhận giao dịch thanh toán vào Transaction/TransactionStudent (idempotent).
        await ensureTransactionRecords({
          db: tx,
          orderId: orderCode,
          studentId: order.studentId,
          totalPrice: Number(order.totalPrice || 0),
          courseItems: order.items.map((item) => ({ courseId: item.courseId })),
          ...(paymentTimestamp ? { paymentTimestamp } : {}),
        });

        await ensureEnrollments({
          db: tx,
          studentId: order.studentId,
          courseItems: order.items.map((item) => ({ courseId: item.courseId })),
        });

        for (const item of order.items) {
          // Ensure revenue exists right after a successful payment.
          const totalAmount = Number(item.price || 0);
          const platformFee = totalAmount * 0.2;
          const lecturerEarn = totalAmount - platformFee;

          await tx.revenue.upsert({
            where: { orderId: orderCode },
            update: {
              totalAmount,
              platformFee,
              lecturerEarn,
              courseId: item.courseId,
              lecturerId: item.lecturerId ?? item.course?.lecturerId ?? null,
            },
            create: {
              orderId: orderCode,
              courseId: item.courseId,
              lecturerId: item.lecturerId ?? item.course?.lecturerId ?? null,
              totalAmount,
              platformFee,
              lecturerEarn,
            },
          });
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
    const paymentTimestamp = extractPaymentTimestamp(latestPaymentInfo);

    // Nếu PayOS trả về status PAID (hoặc DB đã paid trước đó), đảm bảo side-effects đầy đủ.
    if (latestPaymentInfo.status === "PAID" || order.paymentStatus === "paid") {
      if (order.paymentStatus !== "paid") {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "paid",
            status: "processing",
            isSuccess: true,
            updatedAt: new Date(),
          },
        });
      }

      // Tạo enrollment nếu chưa tạo và đảm bảo có Transaction/TransactionStudent
      const orderWithItems = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            select: {
              courseId: true,
              price: true,
              lecturerId: true,
              course: {
                select: { lecturerId: true },
              },
            },
          },
        },
      });

      if (orderWithItems) {
        await ensureTransactionRecords({
          db: prisma,
          orderId,
          studentId: order.studentId,
          totalPrice: Number(order.totalPrice || 0),
          courseItems: orderWithItems.items.map((item) => ({
            courseId: item.courseId,
          })),
          ...(paymentTimestamp ? { paymentTimestamp } : {}),
        });

        await ensureEnrollments({
          db: prisma,
          studentId: order.studentId,
          courseItems: orderWithItems.items.map((item) => ({
            courseId: item.courseId,
          })),
        });

        for (const item of orderWithItems.items) {
          const totalAmount = Number(item.price || 0);
          const platformFee = totalAmount * 0.2;
          const lecturerEarn = totalAmount - platformFee;

          await prisma.revenue.upsert({
            where: { orderId },
            update: {
              totalAmount,
              platformFee,
              lecturerEarn,
              courseId: item.courseId,
              lecturerId: item.lecturerId ?? item.course?.lecturerId ?? null,
            },
            create: {
              orderId,
              courseId: item.courseId,
              lecturerId: item.lecturerId ?? item.course?.lecturerId ?? null,
              totalAmount,
              platformFee,
              lecturerEarn,
            },
          });
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
