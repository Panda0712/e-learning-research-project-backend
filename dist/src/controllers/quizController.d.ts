import { NextFunction, Request, Response } from "express";
export declare const quizController: {
    createQuiz: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateQuiz: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteQuiz: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getQuizById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllQuizzesByLessonId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=quizController.d.ts.map