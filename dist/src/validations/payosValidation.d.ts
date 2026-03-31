import { NextFunction, Request, Response } from "express";
export declare const payosValidation: {
    createPaymentLink: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    checkPaymentStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    cancelPayment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=payosValidation.d.ts.map