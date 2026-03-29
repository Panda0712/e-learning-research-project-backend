import { NextFunction, Request, Response } from "express";
export declare const assessmentValidation: {
    createAssessment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAssessmentsForLecturer: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAssessmentById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getSubmissionDetails: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateAssessment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateFeedback: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteAssessment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=assessmentValidation.d.ts.map