import { IUser } from "@/types/user.type.js";
import { NextFunction, Request, Response } from "express";
declare global {
    namespace Express {
        interface Request {
            jwtDecoded?: any;
            user: IUser;
        }
    }
}
export declare const authMiddleware: {
    isAuthorized: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=authMiddleware.d.ts.map