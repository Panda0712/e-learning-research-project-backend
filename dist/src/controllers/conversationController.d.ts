import { NextFunction, Request, Response } from "express";
export declare const conversationController: {
    createConversation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getConversations: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getMessages: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    markAsSeen: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=conversationController.d.ts.map