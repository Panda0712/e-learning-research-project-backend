import { NextFunction, Request, Response } from "express";
export declare const notificationValidation: {
    createNotification: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getNotificationsByUserId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getNotificationById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    markAsRead: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    markAllAsRead: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteNotification: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getUnreadCount: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=notificationValidation.d.ts.map