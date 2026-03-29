import { NextFunction, Request, Response } from "express";
export declare const orderItemValidation: {
    addItemToOrder: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getOrderItemsByOrderId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getOrderItemById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    removeItemFromOrder: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateOrderItem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteOrderItem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=orderItemValidation.d.ts.map