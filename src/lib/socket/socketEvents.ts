import { getIO } from "./socket.js";

// Emit new notification to specific user
export const emitNewNotification = (
  userId: number,
  notification: {
    id: number;
    title: string;
    message: string;
    type: string;
    createdAt: Date;
  },
) => {
  const io = getIO();
  const room = `user_${userId}`;

  io.to(room).emit("new-notification", {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    createdAt: notification.createdAt,
  });

  console.log(`📢 Notification sent to ${room}`);
};

// Emit order status update
export const emitOrderStatusUpdate = (
  userId: number,
  orderData: {
    orderId: number;
    status: string;
    totalPrice: number;
  },
) => {
  const io = getIO();
  const room = `user_${userId}`;

  io.to(room).emit("order-status-updated", {
    orderId: orderData.orderId,
    status: orderData.status,
    totalPrice: orderData.totalPrice,
    updatedAt: new Date(),
  });

  console.log(`📦 Order update sent to ${room}`);
};

// Emit payment confirmation
export const emitPaymentConfirmation = (
  userId: number,
  paymentData: {
    orderId: number;
    status: string;
  },
) => {
  const io = getIO();
  const room = `user_${userId}`;

  io.to(room).emit("payment-confirmed", {
    orderId: paymentData.orderId,
    status: paymentData.status,
    confirmedAt: new Date(),
  });

  console.log(`💳 Payment confirmation sent to ${room}`);
};

// Emit notification read status
export const emitNotificationRead = (
  userId: number,
  notificationId: number,
) => {
  const io = getIO();
  const room = `user_${userId}`;

  io.to(room).emit("notification-read", {
    notificationId,
  });

  console.log(`✅ Notification read status sent to ${room}`);
};

// Broadcast to all connected users (admin feature)
export const broadcastNotification = (notification: {
  title: string;
  message: string;
  type: string;
}) => {
  const io = getIO();

  io.emit("broadcast-notification", {
    title: notification.title,
    message: notification.message,
    type: notification.type,
    sentAt: new Date(),
  });

  console.log("📢 Broadcast notification sent to all users");
};
