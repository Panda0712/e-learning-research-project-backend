import { NextFunction, Request, Response } from "express";
export declare const transactionValidation: {
    createTransaction: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getHistoryByUserId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getStudentTransactionsByCourseId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=transactionValidation.d.ts.map