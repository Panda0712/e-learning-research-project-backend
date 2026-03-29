import { NextFunction, Request, Response } from "express";
export declare const orderController: {
    createOrder: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getOrderById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getOrdersByStudentId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllOrders: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateOrderStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    cancelOrder: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteOrder: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=orderController.d.ts.map