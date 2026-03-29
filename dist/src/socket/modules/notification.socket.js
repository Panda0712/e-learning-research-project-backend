// define user room
const userRoom = (userId) => `user:${userId.toString()}`;
// register notification socket connection
export const registerNotificationSocketConnection = async (io, socket) => {
    const user = socket.user;
    if (!user)
        return;
    // join user room
    socket.join(userRoom(user.id));
    // join user room event
    socket.on("join-user-room", (userId) => {
        if (userId === user.id)
            socket.join(userRoom(user.id));
    });
    // leave user room event
    socket.on("leave-user-room", (userId) => {
        if (userId === user.id)
            socket.leave(userRoom(user.id));
    });
};
const emitToUser = (io, userId, event, payload) => {
    io.to(userRoom(userId)).emit(event, payload);
};
// emit new notification event
export const emitNewNotification = (io, userId, notification) => {
    emitToUser(io, userId, "new-notification", notification);
    console.log(`📢 Notification sent to ${userRoom(userId)}`);
};
// emit order status update event
export const emitOrderStatusUpdate = (io, userId, orderData) => {
    emitToUser(io, userId, "order-status-updated", {
        orderId: orderData.orderId,
        status: orderData.status,
        totalPrice: orderData.totalPrice,
        updatedAt: new Date(),
    });
    console.log(`📦 Order update sent to ${userRoom(userId)}`);
};
// emit payment confirmation event
export const emitPaymentConfirmation = (io, userId, paymentData) => {
    emitToUser(io, userId, "payment-confirmed", {
        orderId: paymentData.orderId,
        status: paymentData.status,
        confirmedAt: new Date(),
    });
    console.log(`💳 Payment confirmation sent to ${userRoom(userId)}`);
};
// emit notification read status event
export const emitNotificationRead = (io, userId, notificationId) => {
    emitToUser(io, userId, "notification-read", { notificationId });
    console.log(`✅ Notification read status sent to ${userRoom(userId)}`);
};
// emit broadcast notification event
export const broadcastNotification = (io, notification) => {
    io.emit("broadcast-notification", {
        ...notification,
        sentAt: new Date(),
    });
    console.log(`📢 Broadcast notification sent to all users`);
};
//# sourceMappingURL=notification.socket.js.map