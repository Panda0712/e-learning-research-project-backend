import { messageService } from "@/services/messageService.js";
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

const sendDirectMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const senderId = getCurrentUserId(req);
    const payload: {
      conversationId?: number;
      recipientId?: number;
      content?: string;
      imgUrl?: string;
    } = {};
    if (req.body.conversationId) {
      payload.conversationId = Number(req.body.conversationId);
    }
    if (req.body.recipientId) {
      payload.recipientId = Number(req.body.recipientId);
    }
    if (req.body.content) payload.content = req.body.content;
    if (req.body.imgUrl) payload.imgUrl = req.body.imgUrl;

    const result = await messageService.sendDirectMessage(senderId, payload);

    res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

export const messageController = {
  sendDirectMessage,
};
