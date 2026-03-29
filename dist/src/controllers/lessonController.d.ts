import { NextFunction, Request, Response } from "express";
export declare const lessonController: {
    createLesson: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateLesson: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteLesson: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getLessonById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllLessonsByModuleId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getLessonByResourceId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    uploadLessonFiles: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    uploadLessonVideos: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=lessonController.d.ts.map