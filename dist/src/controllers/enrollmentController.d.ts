import { NextFunction, Request, Response } from "express";
export declare const enrollmentController: {
    createEnrollment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getEnrollmentsByStudentId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getStudentsByLecturerId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=enrollmentController.d.ts.map