import { env } from "@/configs/environment.js";
import { socketAuthMiddleware } from "@/middlewares/socketMiddleware.js";
import { conversationService } from "@/services/conversationService.js";
import { AuthenticatedSocket } from "@/types/socket.type.js";
import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: env.CLIENT_URL,
    credentials: true,
  },
});

io.use(socketAuthMiddleware);

const onlineUsers = new Map();

io.on("connection", async (socket: AuthenticatedSocket) => {
  const user = socket.user!;

  if (!onlineUsers.has(user.id)) {
    onlineUsers.set(user.id, new Set());
  }

  onlineUsers.get(user.id).add(socket.id);

  io.emit("online-users", Array.from(onlineUsers.keys()));

  const conversationIds =
    await conversationService.getUserConversationsForSocketIO(user.id);
  conversationIds.forEach((id: number) =>
    socket.join(`conversation:${id.toString()}`),
  );

  socket.on("join-conversation", (conversationId: number) => {
    socket.join(`conversation:${conversationId.toString()}`);
  });

  socket.join(`user:${user.id.toString()}`);

  socket.on("disconnect", () => {
    const userSockets = onlineUsers.get(user.id);
    if (!userSockets) return;

    userSockets.delete(socket.id);

    if (userSockets.size === 0) {
      onlineUsers.delete(user.id);
    }

    io.emit("online-users", Array.from(onlineUsers.keys()));
  });
});

export { app, io, server };
