import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
const chat = async (req, res, next) => {
    const condition = Joi.object({
        question: Joi.string().trim().min(2).max(5000).required(),
        topK: Joi.number().integer().min(1).max(10).optional(),
        conversationId: Joi.string().trim().min(3).max(128).optional(),
    });
    try {
        await condition.validateAsync(req.body, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
    }
};
const ingest = async (req, res, next) => {
    const condition = Joi.object({
        forceReindex: Joi.boolean().optional(),
    });
    try {
        await condition.validateAsync(req.body || {}, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
    }
};
export const chatbotValidation = {
    chat,
    ingest,
};
//# sourceMappingURL=chatbotValidation.js.map