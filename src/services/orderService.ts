import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from "@/utils/constants.js";
import { StatusCodes } from "http-status-codes";

const createOrder = async (data: {
  studentId: number;
  paymentMethod?: string;
  couponCode?: string;
}) => {
  try {
    // Check student exists
    const student = await prisma.user.findUnique({
      where: { id: data.studentId, isDestroyed: false },
    });

    if (!student) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Student not found!");
    }

    // Get items from student's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: data.studentId },
      include: {
        items: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                price: true,
                lecturerId: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Cart not found!");
    }

    if (cart.items.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Cart is empty!");
    }

    // Calculate total price
    let totalPrice = 0;
    const cartItems = cart.items;

    cartItems.forEach((item: any) => {
      totalPrice += item.price || 0;
    });

    // Apply coupon discount if provided
    if (data.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: data.couponCode, isDestroyed: false },
      });

      if (coupon && coupon.status === "active") {
        if (coupon.type === "percentage") {
          totalPrice = totalPrice * (1 - (coupon.amount || 0) / 100);
        } else if (coupon.type === "fixed") {
          totalPrice = Math.max(0, totalPrice - (coupon.amount || 0));
        }
      }
    }

    // Create order
    const newOrder = await prisma.order.create({
      data: {
        studentId: data.studentId,
        totalPrice,
        paymentMethod: data.paymentMethod || "unknown",
        status: "pending",
        items: {
          create: cartItems.map((item: any) => ({
            courseId: item.courseId,
            price: item.price || 0,
            lecturerId: item.course.lecturerId,
          })),
        },
      },
      include: {
        items: {
          include: {
            course: true,
          },
        },
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return newOrder;
  } catch (error: any) {
    throw new Error(error);
  }
};

const getOrderById = async (orderId: number) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId, isDestroyed: false },
      include: {
        items: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                price: true,
                lecturerName: true,
                thumbnail: true,
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Order not found!");
    }

    return order;
  } catch (error: any) {
    throw new Error(error);
  }
};

const getOrdersByStudentId = async (filters: {
  studentId: number;
  page?: number;
  limit?: number;
}) => {
  try {
    const page = filters.page || DEFAULT_PAGE;
    const limit = filters.limit || DEFAULT_ITEMS_PER_PAGE;
    const skip = (page - 1) * limit;

    // Check student exists
    const student = await prisma.user.findUnique({
      where: { id: filters.studentId },
    });

    if (!student) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Student not found!");
    }

    const total = await prisma.order.count({
      where: { studentId: filters.studentId, isDestroyed: false },
    });

    const orders = await prisma.order.findMany({
      where: { studentId: filters.studentId, isDestroyed: false },
      include: {
        items: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    throw new Error(error);
  }
};

const getAllOrders = async (filters: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  try {
    const page = filters.page || DEFAULT_PAGE;
    const limit = filters.limit || DEFAULT_ITEMS_PER_PAGE;
    const skip = (page - 1) * limit;

    const whereCondition: any = { isDestroyed: false };

    if (filters.status) {
      whereCondition.status = filters.status;
    }

    const total = await prisma.order.count({
      where: whereCondition,
    });

    const orders = await prisma.order.findMany({
      where: whereCondition,
      include: {
        items: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    throw new Error(error);
  }
};

const updateOrderStatus = async (orderId: number, newStatus: string) => {
  try {
    // Check order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId, isDestroyed: false },
      include: {
        items: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Order not found!");
    }

    // Validate status transition
    const validStatuses = ["pending", "paid", "completed", "cancelled"];
    if (!validStatuses.includes(newStatus)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      );
    }

    // Validate status flow: pending → paid → completed
    if (order.status === "cancelled") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Cannot update a cancelled order!",
      );
    }

    if (order.status === "completed") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Cannot update a completed order!",
      );
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
      },
      include: {
        items: {
          include: {
            course: true,
          },
        },
      },
    });

    // Create revenue when order is completed
    if (newStatus === "completed" && order.status !== "completed") {
      for (const item of order.items) {
        // Calculate platform fee (e.g., 20%) and lecturer earning (80%)
        const platformFeePercent = 0.2;
        const totalAmount = item.price || 0;
        const platformFee = totalAmount * platformFeePercent;
        const lecturerEarn = totalAmount - platformFee;

        await prisma.revenue.upsert({
          where: { orderId },
          update: {
            totalAmount,
            platformFee,
            lecturerEarn,
          },
          create: {
            orderId,
            courseId: item.courseId,
            lecturerId: item.lecturerId ? item.lecturerId : null,
            totalAmount,
            platformFee,
            lecturerEarn,
          },
        });
      }
    }

    return updatedOrder;
  } catch (error: any) {
    throw new Error(error);
  }
};

const cancelOrder = async (orderId: number) => {
  try {
    // Check order exists and status is pending
    const order = await prisma.order.findUnique({
      where: { id: orderId, isDestroyed: false },
    });

    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Order not found!");
    }

    if (order.status !== "pending") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Cannot cancel order with status: ${order.status}. Only pending orders can be cancelled.`,
      );
    }

    // Update status to cancelled
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "cancelled" },
    });

    return { message: "Order cancelled successfully!" };
  } catch (error: any) {
    throw new Error(error);
  }
};

const deleteOrder = async (orderId: number) => {
  try {
    // Check order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId, isDestroyed: false },
    });

    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Order not found!");
    }

    // Soft delete
    await prisma.order.update({
      where: { id: orderId },
      data: { isDestroyed: true },
    });

    return { message: "Order deleted successfully!" };
  } catch (error: any) {
    throw new Error(error);
  }
};

export const orderService = {
  createOrder,
  getOrderById,
  getOrdersByStudentId,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
};
