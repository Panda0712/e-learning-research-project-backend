import { NextFunction, Request, Response } from "express";
export declare const conversationValidation: {
    createConversation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getMessages: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    markAsSeen: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=conversationValidation.d.ts.map