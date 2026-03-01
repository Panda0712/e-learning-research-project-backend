import { AuthenticatedSocket } from "@/types/socket.type.js";
import { Server } from "socket.io";

// define user room
const userRoom = (userId: number) => `user:${userId.toString()}`;

// register notification socket connection
export const registerNotificationSocketConnection = async (
  io: Server,
  socket: AuthenticatedSocket,
) => {
  const user = socket.user;
  if (!user) return;

  // join user room
  socket.join(userRoom(user.id));

  // join user room event
  socket.on("join-user-room", (userId: number) => {
    if (userId === user.id) socket.join(userRoom(user.id));
  });

  // leave user room event
  socket.on("leave-user-room", (userId: number) => {
    if (userId === user.id) socket.leave(userRoom(user.id));
  });
};

const emitToUser = (
  io: Server,
  userId: number,
  event: string,
  payload: any,
) => {
  io.to(userRoom(userId)).emit(event, payload);
};

// emit new notification event
export const emitNewNotification = (
  io: Server,
  userId: number,
  notification: {
    id: number;
    title: string;
    message: string;
    type: string;
    createdAt: Date;
  },
) => {
  emitToUser(io, userId, "new-notification", notification);

  console.log(`📢 Notification sent to ${userRoom(userId)}`);
};

// emit order status update event
export const emitOrderStatusUpdate = (
  io: Server,
  userId: number,
  orderData: {
    orderId: number;
    status: string;
    totalPrice: number;
  },
) => {
  emitToUser(io, userId, "order-status-updated", {
    orderId: orderData.orderId,
    status: orderData.status,
    totalPrice: orderData.totalPrice,
    updatedAt: new Date(),
  });

  console.log(`📦 Order update sent to ${userRoom(userId)}`);
};

// emit payment confirmation event
export const emitPaymentConfirmation = (
  io: Server,
  userId: number,
  paymentData: {
    orderId: number;
    status: string;
  },
) => {
  emitToUser(io, userId, "payment-confirmed", {
    orderId: paymentData.orderId,
    status: paymentData.status,
    confirmedAt: new Date(),
  });

  console.log(`💳 Payment confirmation sent to ${userRoom(userId)}`);
};

// emit notification read status event
export const emitNotificationRead = (
  io: Server,
  userId: number,
  notificationId: number,
) => {
  emitToUser(io, userId, "notification-read", { notificationId });

  console.log(`✅ Notification read status sent to ${userRoom(userId)}`);
};

// emit broadcast notification event
export const broadcastNotification = (
  io: Server,
  notification: {
    title: string;
    message: string;
    type: string;
  },
) => {
  io.emit("broadcast-notification", {
    ...notification,
    sentAt: new Date(),
  });

  console.log(`📢 Broadcast notification sent to all users`);
};
