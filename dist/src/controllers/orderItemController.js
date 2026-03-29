import { orderItemService } from "@/services/orderItemService.js";
import { StatusCodes } from "http-status-codes";
const addItemToOrder = async (req, res, next) => {
    try {
        const result = await orderItemService.addItemToOrder(req.body);
        res.status(StatusCodes.CREATED).json(result);
    }
    catch (error) {
        next(error);
    }
};
const getOrderItemsByOrderId = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const items = await orderItemService.getOrderItemsByOrderId(Number(orderId));
        res.status(StatusCodes.OK).json(items);
    }
    catch (error) {
        next(error);
    }
};
const getOrderItemById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const item = await orderItemService.getOrderItemById(Number(id));
        res.status(StatusCodes.OK).json(item);
    }
    catch (error) {
        next(error);
    }
};
const removeItemFromOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await orderItemService.removeItemFromOrder(Number(id));
        res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
const updateOrderItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updated = await orderItemService.updateOrderItem(Number(id), req.body);
        res.status(StatusCodes.OK).json(updated);
    }
    catch (error) {
        next(error);
    }
};
const deleteOrderItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await orderItemService.deleteOrderItem(Number(id));
        res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
export const orderItemController = {
    addItemToOrder,
    getOrderItemsByOrderId,
    getOrderItemById,
    removeItemFromOrder,
    updateOrderItem,
    deleteOrderItem,
};
//# sourceMappingURL=orderItemController.js.map