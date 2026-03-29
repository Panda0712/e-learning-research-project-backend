import { NextFunction, Request, Response } from "express";
export declare const couponController: {
    createCouponCategory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllCouponCategories: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getCouponCategoryById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateCouponCategory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteCouponCategory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createCoupon: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllCoupons: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getCouponById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getCouponByCode: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateCoupon: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteCoupon: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    verifyCouponCode: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=couponController.d.ts.map