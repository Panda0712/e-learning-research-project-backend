import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
const createPaymentLink = async (req, res, next) => {
    const correctCondition = Joi.object({
        orderId: Joi.number().required().positive(),
        returnUrl: Joi.string().optional().uri(),
        cancelUrl: Joi.string().optional().uri(),
    });
    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const checkPaymentStatus = async (req, res, next) => {
    const correctCondition = Joi.object({
        orderId: Joi.number().required().positive(),
    });
    try {
        await correctCondition.validateAsync(req.params, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const cancelPayment = async (req, res, next) => {
    const correctCondition = Joi.object({
        orderId: Joi.number().required().positive(),
    });
    try {
        await correctCondition.validateAsync(req.params, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
export const payosValidation = {
    createPaymentLink,
    checkPaymentStatus,
    cancelPayment,
};
//# sourceMappingURL=payosValidation.js.map