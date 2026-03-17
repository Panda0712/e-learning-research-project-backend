import { notificationController } from "@/controllers/notificationController.js";
import { notificationValidation } from "@/validations/notificationValidation.js";
import express from "express";

const Router = express.Router();

// Create notification (admin only in real app)
Router.route("/").post(
  notificationValidation.createNotification,
  notificationController.createNotification,
);

// Get notifications by user ID with pagination
Router.route("/user/:userId").get(
  notificationValidation.getNotificationsByUserId,
  notificationController.getNotificationsByUserId,
);

// Get unread count
Router.route("/user/:userId/unread-count").get(
  notificationValidation.getUnreadCount,
  notificationController.getUnreadCount,
);

// Mark all as read
Router.route("/user/:userId/mark-all-read").put(
  notificationValidation.markAllAsRead,
  notificationController.markAllAsRead,
);

// Get notification by ID
Router.route("/:id").get(
  notificationValidation.getNotificationById,
  notificationController.getNotificationById,
);

// Mark as read
Router.route("/:id/read").put(
  notificationValidation.markAsRead,
  notificationController.markAsRead,
);

// Delete notification
Router.route("/:id").delete(
  notificationValidation.deleteNotification,
  notificationController.deleteNotification,
);

export const notificationRoute = Router;
