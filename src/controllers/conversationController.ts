import { conversationService } from "@/services/conversationService.js";
import ApiError from "@/utils/ApiError.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const getCurrentUserId = (req: Request) => {
  const userId = Number(req.jwtDecoded?.id ?? req.user?.id);
  if (!userId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized!");
  }
  return userId;
};

const createConversation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getCurrentUserId(req);
    const result = await conversationService.createConversation(
      userId,
      Number(req.body.recipientId),
    );

    res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

const getConversations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getCurrentUserId(req);
    const result = await conversationService.getConversations(userId);

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getCurrentUserId(req);
    const conversationId = Number(req.params.conversationId);
    const options: { limit?: number; cursor?: string } = {};
    if (req.query.limit) options.limit = Number(req.query.limit);
    if (req.query.cursor) options.cursor = String(req.query.cursor);

    const result = await conversationService.getMessages(conversationId, userId, options);

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const markAsSeen = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getCurrentUserId(req);
    const conversationId = Number(req.params.conversationId);

    const result = await conversationService.markAsSeen(conversationId, userId);

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const conversationController = {
  createConversation,
  getConversations,
  getMessages,
  markAsSeen,
};
