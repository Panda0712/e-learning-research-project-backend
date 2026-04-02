import { prisma } from "@/lib/prisma.js";
import { getIO } from "@/socket/index.js";
import { emitNewNotification } from "@/socket/modules/notification.socket.js";
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
    throw error;
  }
};

const createNotificationIfNotExists = async (data: {
  userId: number;
  title: string;
  message: string;
  type?: string;
  relatedId?: number;
}) => {
  try {
    const normalizedType = data.type || "info";
    const hasRelatedId =
      data.relatedId !== undefined && data.relatedId !== null;

    if (hasRelatedId) {
      const relatedId = data.relatedId as number;
      const existing = await prisma.notification.findFirst({
        where: {
          userId: data.userId,
          type: normalizedType,
          relatedId,
          isDestroyed: false,
        },
      });

      if (existing) return existing;
    }

    return await createNotification({
      ...data,
      type: normalizedType,
    });
  } catch (error: any) {
    throw error;
  }
};

const emitNotificationSafely = (notification: {
  id: number;
  userId: number;
  title: string;
  message: string;
  relatedId?: number | null;
  type: string;
  createdAt: Date;
}) => {
  try {
    const io = getIO();
    emitNewNotification(io, notification.userId, {
      id: notification.id,
      userId: notification.userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      relatedId: notification.relatedId ?? null,
      createdAt: notification.createdAt,
    });
  } catch {
    // Keep API flow unaffected when socket server is unavailable.
  }
};

const createAndDispatchNotification = async (
  data: {
    userId: number;
    title: string;
    message: string;
    type?: string;
    relatedId?: number;
  },
  options?: { dedupe?: boolean },
) => {
  const notification = options?.dedupe
    ? await createNotificationIfNotExists(data)
    : await createNotification(data);

  emitNotificationSafely({
    id: notification.id,
    userId: notification.userId,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    relatedId: notification.relatedId ?? null,
    createdAt: notification.createdAt,
  });

  return notification;
};

const createAndDispatchNotificationsForUsers = async (
  data: {
    userIds: number[];
    title: string;
    message: string;
    type?: string;
    relatedId?: number;
  },
  options?: { dedupe?: boolean },
) => {
  const uniqueUserIds = [...new Set(data.userIds)].filter(
    (userId) => Number.isInteger(userId) && userId > 0,
  );

  if (uniqueUserIds.length === 0) return [];

  const results = [];

  for (const userId of uniqueUserIds) {
    const payload: {
      userId: number;
      title: string;
      message: string;
      type?: string;
      relatedId?: number;
    } = {
      userId,
      title: data.title,
      message: data.message,
    };

    if (data.type !== undefined) {
      payload.type = data.type;
    }

    if (data.relatedId !== undefined) {
      payload.relatedId = data.relatedId;
    }

    const notification = await createAndDispatchNotification(payload, options);

    results.push(notification);
  }

  return results;
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
    throw error;
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
    throw error;
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
    throw error;
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
    throw error;
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
    throw error;
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
    throw error;
  }
};

export const notificationService = {
  createNotification,
  createNotificationIfNotExists,
  createAndDispatchNotification,
  createAndDispatchNotificationsForUsers,
  getNotificationsByUserId,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
};
