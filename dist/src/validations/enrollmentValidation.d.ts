import { NextFunction, Request, Response } from "express";
export declare const enrollmentValidation: {
    createEnrollment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getEnrollmentsByStudentId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getStudentsByLecturerId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=enrollmentValidation.d.ts.map