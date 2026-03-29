import { NextFunction, Request, Response } from "express";
export declare const rbacMiddleware: {
    isValidPermission: (requiredPermissions: string[]) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=rbacMiddleware.d.ts.map