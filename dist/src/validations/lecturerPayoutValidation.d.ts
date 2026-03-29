import { NextFunction, Request, Response } from "express";
export declare const lecturerPayoutValidation: {
    createLecturerPayout: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getLecturerPayoutById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPayoutsByLecturerId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateLecturerPayout: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updatePayoutStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteLecturerPayout: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=lecturerPayoutValidation.d.ts.map