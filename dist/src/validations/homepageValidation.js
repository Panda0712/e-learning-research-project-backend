import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
const getHomepageData = async (req, res, next) => {
    const correctCondition = Joi.object({
        popularLimit: Joi.number().integer().min(1).max(24).default(6),
        reviewLimit: Joi.number().integer().min(1).max(12).default(3),
    });
    try {
        await correctCondition.validateAsync(req.query, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
export const homepageValidation = {
    getHomepageData,
};
//# sourceMappingURL=homepageValidation.js.map