import { NextFunction, Request, Response } from "express";
export declare const quizValidation: {
    createQuiz: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateQuiz: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteQuiz: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getQuizById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllQuizzesByLessonId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=quizValidation.d.ts.map