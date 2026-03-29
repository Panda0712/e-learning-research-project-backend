import { NextFunction, Request, Response } from "express";
export declare const cartValidation: {
    getCartByUserId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    addToCart: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    removeItem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=cartValidation.d.ts.map