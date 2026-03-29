import { AuthenticatedSocket } from "@/types/socket.type.js";
import { Server } from "socket.io";
export declare const registerChatSocketConnection: (io: Server, socket: AuthenticatedSocket) => Promise<void>;
export declare const emitToConversation: (io: Server, conversationId: number, event: string, payload: any) => void;
//# sourceMappingURL=chat.socket.d.ts.map