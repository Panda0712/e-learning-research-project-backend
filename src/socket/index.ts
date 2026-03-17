import { setupApp } from "@/app.js";
import { env } from "@/configs/environment.js";
import { socketAuthMiddleware } from "@/middlewares/socketMiddleware.js";
import { AuthenticatedSocket } from "@/types/socket.type.js";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { registerChatSocketConnection } from "./modules/chat.socket.js";
import { registerNotificationSocketConnection } from "./modules/notification.socket.js";

const app = express();
const server = http.createServer(app);

await setupApp(app);

let io: Server | null = null;

export const setupSocket = (httpServer: http.Server = server) => {
  if (io) return io;

  // init io server
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  // socket middleware
  io.use(socketAuthMiddleware);

  // handle socket connection
  io.on("connection", (socket: AuthenticatedSocket) => {
    registerChatSocketConnection(io!, socket);
    registerNotificationSocketConnection(io!, socket);
  });

  return io;
};

export const getIO = () => {
  if (!io)
    throw new Error("Socket.io not initialized. Call setupSocket first.");

  return io;
};

export { app, server };
