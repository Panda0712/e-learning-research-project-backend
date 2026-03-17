import { notificationService } from "@/services/notificationService.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const createNotification = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await notificationService.createNotification(req.body);
    res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

const getNotificationsByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;
    const { page, limit, isRead } = req.query;
    const filterParams: any = { userId: Number(userId) };

    if (page) filterParams.page = Number(page);
    if (limit) filterParams.limit = Number(limit);
    if (isRead !== undefined) {
      filterParams.isRead = isRead === "true";
    }

    const result = await notificationService.getNotificationsByUserId(
      filterParams,
    );
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getNotificationById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const notification = await notificationService.getNotificationById(
      Number(id),
    );
    res.status(StatusCodes.OK).json(notification);
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updated = await notificationService.markAsRead(Number(id));
    res.status(StatusCodes.OK).json(updated);
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;
    const result = await notificationService.markAllAsRead(Number(userId));
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await notificationService.deleteNotification(Number(id));
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getUnreadCount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;
    const result = await notificationService.getUnreadCount(Number(userId));
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const notificationController = {
  createNotification,
  getNotificationsByUserId,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
};
