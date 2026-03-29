import { NextFunction, Request, Response } from "express";
export declare const courseReviewValidation: {
    createCourseReview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getCourseReviewById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getReviewsByCourseId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getReviewsByStudentId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateCourseReview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteCourseReview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=courseReviewValidation.d.ts.map