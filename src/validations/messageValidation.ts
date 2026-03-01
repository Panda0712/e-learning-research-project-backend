import ApiError from "@/utils/ApiError.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";

const sendDirectMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
  } catch (error: any) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

export const messageValidation = {
  sendDirectMessage,
};
