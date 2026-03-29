import { NextFunction, Request, Response } from "express";
export declare const lecturerPayoutAccountValidation: {
    createLecturerPayoutAccount: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getLecturerPayoutAccountById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPayoutAccountsByLecturerId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getDefaultPayoutAccount: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateLecturerPayoutAccount: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    setDefaultPayoutAccount: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteLecturerPayoutAccount: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=lecturerPayoutAccountValidation.d.ts.map