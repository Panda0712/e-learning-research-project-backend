import ApiError from "@/utils/ApiError.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";

const createConversation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    recipientId: Joi.number().required().integer().positive(),
  });

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error: any) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  const paramsCondition = Joi.object({
    conversationId: Joi.number().required().integer().positive(),
  });

  const queryCondition = Joi.object({
    limit: Joi.number().integer().min(1).max(100).optional(),
    cursor: Joi.date().iso().optional(),
  });

  try {
    await paramsCondition.validateAsync(req.params, { abortEarly: false });
    await queryCondition.validateAsync(req.query, { abortEarly: false });
    next();
  } catch (error: any) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

const markAsSeen = async (req: Request, res: Response, next: NextFunction) => {
  const correctCondition = Joi.object({
    conversationId: Joi.number().required().integer().positive(),
  });

  try {
    await correctCondition.validateAsync(req.params, { abortEarly: false });
    next();
  } catch (error: any) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message));
  }
};

export const conversationValidation = {
  createConversation,
  getMessages,
  markAsSeen,
};
