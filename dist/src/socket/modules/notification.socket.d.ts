import { AuthenticatedSocket } from "@/types/socket.type.js";
import { Server } from "socket.io";
export declare const registerNotificationSocketConnection: (io: Server, socket: AuthenticatedSocket) => Promise<void>;
export declare const emitNewNotification: (io: Server, userId: number, notification: {
    id: number;
    title: string;
    message: string;
    type: string;
    createdAt: Date;
}) => void;
export declare const emitOrderStatusUpdate: (io: Server, userId: number, orderData: {
    orderId: number;
    status: string;
    totalPrice: number;
}) => void;
export declare const emitPaymentConfirmation: (io: Server, userId: number, paymentData: {
    orderId: number;
    status: string;
}) => void;
export declare const emitNotificationRead: (io: Server, userId: number, notificationId: number) => void;
export declare const broadcastNotification: (io: Server, notification: {
    title: string;
    message: string;
    type: string;
}) => void;
//# sourceMappingURL=notification.socket.d.ts.map