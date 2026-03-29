import { cartService } from "@/services/cartService.js";
import { StatusCodes } from "http-status-codes";
const getCartByUserId = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const result = await cartService.getCartByUserId(Number(userId));
        res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
const addToCart = async (req, res, next) => {
    try {
        const userId = Number(req.body.userId);
        const courseId = Number(req.body.courseId);
        const price = Number(req.body.price);
        const result = await cartService.addToCart({ userId, courseId, price });
        res.status(StatusCodes.CREATED).json(result);
    }
    catch (error) {
        next(error);
    }
};
const removeItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await cartService.removeItem(Number(id));
        res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
export const cartController = { getCartByUserId, addToCart, removeItem };
//# sourceMappingURL=cartController.js.map