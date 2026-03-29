import { NextFunction, Request, Response } from "express";
export declare const resourceValidation: {
    createResource: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getResourceById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getResourceByPublicId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllResourcesByFileType: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteResource: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteResourceByPublicId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=resourceValidation.d.ts.map