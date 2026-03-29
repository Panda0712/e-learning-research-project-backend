import { NextFunction, Request, Response } from "express";
export declare const submissionController: {
    createSubmission: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getSubmissionById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllSubmissions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getSubmissionsByStudentId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateSubmission: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    gradeSubmission: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteSubmission: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=submissionController.d.ts.map