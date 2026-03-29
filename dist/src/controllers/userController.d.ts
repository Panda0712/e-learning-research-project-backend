import { NextFunction, Request, Response } from "express";
export declare const userController: {
    register: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    verifyAccount: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    logout: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    handleRefreshToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    registerLecturerProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPublicLecturers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPublicLecturerDetail: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    forgotPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    resetPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    uploadAvatar: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    uploadLecturerFile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    googleAuthStartHandler: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    googleAuthCallbackHandler: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getMe: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    facebookAuthHandler: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=userController.d.ts.map