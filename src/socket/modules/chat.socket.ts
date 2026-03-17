import { conversationService } from "@/services/conversationService.js";
import { AuthenticatedSocket } from "@/types/socket.type.js";
import { Server } from "socket.io";

// online users map
const onlineUsers = new Map<number, Set<string>>();

// define user room and conversation room
const userRoom = (userId: number) => `user:${userId.toString()}`;
const conversationRoom = (conversationId: number) =>
  `conversation:${conversationId.toString()}`;

// emit online users event
const emitOnlineUsers = (io: Server) => {
  io.emit("online-users", Array.from(onlineUsers.keys()));
};

// register chat socket connection
export const registerChatSocketConnection = async (
  io: Server,
  socket: AuthenticatedSocket,
) => {
  const user = socket.user;
  if (!user) {
    socket.disconnect(true);
    return;
  }

  // add online user
  if (!onlineUsers.has(user.id)) {
    onlineUsers.set(user.id, new Set());
  }
  onlineUsers.get(user.id)!.add(socket.id);

  // join user room and emit online users
  socket.join(userRoom(user.id));
  emitOnlineUsers(io);

  // get conversation ids list for user and join conversation rooms
  try {
    const conversationIds =
      await conversationService.getUserConversationsForSocketIO(user.id);

    conversationIds.forEach((id: number) => socket.join(conversationRoom(id)));
  } catch (error) {
    console.error("Join conversation rooms failed:", error);
  }

  // join new conversation room
  socket.on("join-conversation", (conversationId: number) => {
    socket.join(conversationRoom(conversationId));
  });

  // leave conversation room
  socket.on("leave-conversation", (conversationId: number) => {
    socket.leave(conversationRoom(conversationId));
  });

  // disconnect socket
  socket.on("disconnect", () => {
    const sockets = onlineUsers.get(user.id);
    if (!sockets) return;

    sockets.delete(socket.id);
    if (sockets.size === 0) onlineUsers.delete(user.id);

    emitOnlineUsers(io);
  });
};

// emit helper for chat domain
export const emitToConversation = (
  io: Server,
  conversationId: number,
  event: string,
  payload: any,
) => {
  io.to(conversationRoom(conversationId)).emit(event, payload);
};
