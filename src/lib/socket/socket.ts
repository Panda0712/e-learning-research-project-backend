import { Server as SocketIOServer } from "socket.io";
import http from "http";

let io: SocketIOServer;

export const setupSocket = (server: http.Server) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3001",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    // Client joins their user room
    socket.on("join-user-room", (userId: number) => {
      const room = `user_${userId}`;
      socket.join(room);
      console.log(`✅ User ${userId} joined room ${room}`);
    });

    // Client leaves their user room
    socket.on("leave-user-room", (userId: number) => {
      const room = `user_${userId}`;
      socket.leave(room);
      console.log(`❌ User ${userId} left room ${room}`);
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  console.log("✅ Socket.io server initialized");
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized. Call setupSocket first.");
  }
  return io;
};
