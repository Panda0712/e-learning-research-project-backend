import { NextFunction, Request, Response } from "express";
export declare const register: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const verifyAccount: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const update: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const registerLecturer: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPublicLecturers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPublicLecturerById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const userValidation: {
    register: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    verifyAccount: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    update: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    registerLecturer: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPublicLecturers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPublicLecturerById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    forgotPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    resetPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=userValidation.d.ts.map