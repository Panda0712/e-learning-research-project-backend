import Joi from "joi";
import { StatusCodes } from "http-status-codes";
import ApiError from "@/utils/ApiError.js";
const getCartByUserId = async (req, res, next) => {
    const correctCondition = Joi.object({
        userId: Joi.number().required().positive(),
    });
    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const addToCart = async (req, res, next) => {
    const correctCondition = Joi.object({
        userId: Joi.number().required().positive(),
        courseId: Joi.number().required().positive(),
        price: Joi.number().required().positive(),
    });
    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const removeItem = async (req, res, next) => {
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
export const cartValidation = {
    getCartByUserId,
    addToCart,
    removeItem,
};
//# sourceMappingURL=cartValidation.js.map