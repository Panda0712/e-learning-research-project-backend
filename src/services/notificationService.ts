import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from "@/utils/constants.js";
import { StatusCodes } from "http-status-codes";

const createNotification = async (data: {
  userId: number;
  title: string;
  message: string;
  type?: string;
  relatedId?: number;
}) => {
  try {
    // Check user exists
    const user = await prisma.user.findUnique({
      where: { id: data.userId, isDestroyed: false },
    });

    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
    }

    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type || "info",
        relatedId: data.relatedId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return notification;
  } catch (error: any) {
    throw new Error(error);
  }
};

const getNotificationsByUserId = async (filters: {
  userId: number;
  page?: number;
  limit?: number;
  isRead?: boolean;
}) => {
  try {
    const page = filters.page || DEFAULT_PAGE;
    const limit = filters.limit || DEFAULT_ITEMS_PER_PAGE;
    const skip = (page - 1) * limit;

    // Check user exists
    const user = await prisma.user.findUnique({
      where: { id: filters.userId },
    });

    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
    }

    const whereCondition: any = {
      userId: filters.userId,
      isDestroyed: false,
    };

    if (filters.isRead !== undefined) {
      whereCondition.isRead = filters.isRead;
    }

    const total = await prisma.notification.count({
      where: whereCondition,
    });

    const notifications = await prisma.notification.findMany({
      where: whereCondition,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    return {
      data: notifications,
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

const getNotificationById = async (notificationId: number) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId, isDestroyed: false },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!notification) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Notification not found!");
    }

    return notification;
  } catch (error: any) {
    throw new Error(error);
  }
};

const markAsRead = async (notificationId: number) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId, isDestroyed: false },
    });

    if (!notification) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Notification not found!");
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return updated;
  } catch (error: any) {
    throw new Error(error);
  }
};

const markAllAsRead = async (userId: number) => {
  try {
    // Check user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
    }

    const result = await prisma.notification.updateMany({
      where: { userId, isDestroyed: false, isRead: false },
      data: { isRead: true },
    });

    return {
      message: `${result.count} notifications marked as read`,
      count: result.count,
    };
  } catch (error: any) {
    throw new Error(error);
  }
};

const deleteNotification = async (notificationId: number) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId, isDestroyed: false },
    });

    if (!notification) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Notification not found!");
    }

    // Soft delete
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isDestroyed: true },
    });

    return { message: "Notification deleted successfully!" };
  } catch (error: any) {
    throw new Error(error);
  }
};

const getUnreadCount = async (userId: number) => {
  try {
    // Check user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
    }

    const count = await prisma.notification.count({
      where: { userId, isDestroyed: false, isRead: false },
    });

    return { unreadCount: count };
  } catch (error: any) {
    throw new Error(error);
  }
};

export const notificationService = {
  createNotification,
  getNotificationsByUserId,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
};
