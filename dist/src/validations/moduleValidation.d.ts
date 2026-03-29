import { NextFunction, Request, Response } from "express";
export declare const moduleValidation: {
    createModule: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateModule: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteModule: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getModuleById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllModulesByCourseId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=moduleValidation.d.ts.map