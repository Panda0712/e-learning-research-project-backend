import { NextFunction, Request, Response } from "express";
export declare const transactionController: {
    createTransaction: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getHistoryByUserId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getStudentTransactionsByCourseId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllTransactions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=transactionController.d.ts.map