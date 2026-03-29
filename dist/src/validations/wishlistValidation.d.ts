import { NextFunction, Request, Response } from "express";
export declare const wishlistValidation: {
    createWishlist: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getWishlistById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getWishlistsByUserId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    checkCourseInWishlist: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateWishlist: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteWishlist: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteWishlistByCourse: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=wishlistValidation.d.ts.map