import { NextFunction, Request, Response } from "express";
export declare const lessonValidation: {
    createLesson: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateLesson: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteLesson: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getLessonById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllLessonsByModuleId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getLessonByResourceId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=lessonValidation.d.ts.map