import { NextFunction, Request, Response } from "express";
export declare const questionValidation: {
    createQuestion: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateQuestion: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteQuestion: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getQuestionById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllQuestionsByQuizId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=questionValidation.d.ts.map