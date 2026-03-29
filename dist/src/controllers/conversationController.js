import { conversationService } from "@/services/conversationService.js";
import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
const getCurrentUserId = (req) => {
    const userId = Number(req.jwtDecoded?.id ?? req.user?.id);
    if (!userId) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized!");
    }
    return userId;
};
const createConversation = async (req, res, next) => {
    try {
        const userId = getCurrentUserId(req);
        const result = await conversationService.createConversation(userId, Number(req.body.recipientId));
        res.status(StatusCodes.CREATED).json(result);
    }
    catch (error) {
        next(error);
    }
};
const getConversations = async (req, res, next) => {
    try {
        const userId = getCurrentUserId(req);
        const result = await conversationService.getConversations(userId);
        res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
const getMessages = async (req, res, next) => {
    try {
        const userId = getCurrentUserId(req);
        const conversationId = Number(req.params.conversationId);
        const options = {};
        if (req.query.limit)
            options.limit = Number(req.query.limit);
        if (req.query.cursor)
            options.cursor = Number(req.query.cursor);
        const result = await conversationService.getMessages(conversationId, userId, options);
        res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
const markAsSeen = async (req, res, next) => {
    try {
        const userId = getCurrentUserId(req);
        const conversationId = Number(req.params.conversationId);
        const result = await conversationService.markAsSeen(conversationId, userId);
        res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
export const conversationController = {
    createConversation,
    getConversations,
    getMessages,
    markAsSeen,
};
//# sourceMappingURL=conversationController.js.map