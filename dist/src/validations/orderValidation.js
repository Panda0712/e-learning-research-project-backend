import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
const createOrder = async (req, res, next) => {
    const correctCondition = Joi.object({
        studentId: Joi.number().required().positive(),
        paymentMethod: Joi.string().optional(),
        couponCode: Joi.string().optional(),
        // Allow items array for PayOS payment
        items: Joi.array()
            .optional()
            .items(Joi.object({
            courseId: Joi.number().required().positive(),
            quantity: Joi.number().required().positive(),
            price: Joi.number().required().positive(),
        })),
    }).unknown(true); // Allow unknown fields
    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const getOrderById = async (req, res, next) => {
    const correctCondition = Joi.object({
        id: Joi.number().required().positive(),
    });
    try {
        await correctCondition.validateAsync(req.params, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const getOrdersByStudentId = async (req, res, next) => {
    const correctCondition = Joi.object({
        studentId: Joi.number().required().positive(),
    });
    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const updateOrderStatus = async (req, res, next) => {
    const paramCondition = Joi.object({
        id: Joi.number().required().positive(),
    });
    const bodyCondition = Joi.object({
        status: Joi.string()
            .required()
            .valid("pending", "paid", "completed", "cancelled"),
    });
    try {
        await paramCondition.validateAsync(req.params, { abortEarly: false });
        await bodyCondition.validateAsync(req.body, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const cancelOrder = async (req, res, next) => {
    const correctCondition = Joi.object({
        id: Joi.number().required().positive(),
    });
    try {
        await correctCondition.validateAsync(req.params, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const deleteOrder = async (req, res, next) => {
    const correctCondition = Joi.object({
        id: Joi.number().required().positive(),
    });
    try {
        await correctCondition.validateAsync(req.params, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
export const orderValidation = {
    createOrder,
    getOrderById,
    getOrdersByStudentId,
    updateOrderStatus,
    cancelOrder,
    deleteOrder,
};
//# sourceMappingURL=orderValidation.js.map