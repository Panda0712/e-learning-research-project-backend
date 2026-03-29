import { NextFunction, Request, Response } from "express";
export declare const payosController: {
    createPaymentLink: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    handleWebhook: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    checkPaymentStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    cancelPayment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=payosController.d.ts.map