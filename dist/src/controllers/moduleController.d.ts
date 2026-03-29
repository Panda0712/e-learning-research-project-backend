import { NextFunction, Request, Response } from "express";
export declare const moduleController: {
    createModule: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateModule: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteModule: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getModuleById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllModulesByCourseId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=moduleController.d.ts.map