import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
const sendDirectMessage = async (req, res, next) => {
    const correctCondition = Joi.object({
        conversationId: Joi.number().integer().positive().optional(),
        recipientId: Joi.number().integer().positive().optional(),
        content: Joi.string().min(1).max(5000).trim().strict().optional(),
        imgUrl: Joi.string().uri().optional(),
    })
        .or("conversationId", "recipientId")
        .or("content", "imgUrl");
    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
    }
};
export const messageValidation = {
    sendDirectMessage,
};
//# sourceMappingURL=messageValidation.js.map