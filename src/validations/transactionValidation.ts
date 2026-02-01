import ApiError from "@/utils/ApiError.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";

const createTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    userId: Joi.number().required().positive(),
    items: Joi.array()
      .required()
      .items(
        Joi.object({
          courseId: Joi.number().required().positive(),
          discountCode: Joi.string().optional().min(2).max(50).trim().strict(),
          discountAmount: Joi.number().optional().positive(),
          isDiscount: Joi.boolean().required(),
        }),
      ),
    paymentMethod: Joi.string().required().min(2).max(50).trim().strict(),
    totalAmount: Joi.number().required().positive(),
  });

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error: any) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message),
    );
  }
};

const getHistoryByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    userId: Joi.number().required().positive(),
  });

  try {
    await correctCondition.validateAsync(req.params, { abortEarly: false });
    next();
  } catch (error: any) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message),
    );
  }
};

const getStudentTransactionsByCourseId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    courseId: Joi.number().required().positive(),
  });

  try {
    await correctCondition.validateAsync(req.params, { abortEarly: false });
    next();
  } catch (error: any) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message),
    );
  }
};

export const transactionValidation = {
  createTransaction,
  getHistoryByUserId,
  getStudentTransactionsByCourseId,
};
