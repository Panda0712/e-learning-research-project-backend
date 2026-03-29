import { NextFunction, Request, Response } from "express";
export declare const dashboardValidation: {
    getGeneralStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getRevenueChart: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getTopRanking: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=dashboardValidation.d.ts.map