import { NextFunction, Request, Response } from "express";
export declare const chatbotController: {
    chat: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getIngestionStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    runIngestion: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=chatbotController.d.ts.map