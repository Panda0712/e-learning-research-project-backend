import ApiError from "@/utils/ApiError.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";

const createLecturerPayout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    transactionId: Joi.number().optional().positive(),
    lecturerId: Joi.number().required().positive(),
    payoutAccountId: Joi.number().optional().positive(),
    currency: Joi.string().optional(),
    amount: Joi.number().optional().positive(),
    payoutMethod: Joi.string().optional(),
    status: Joi.string().optional().valid("success", "failed"),
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

const getLecturerPayoutById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    id: Joi.number().required().positive(),
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

const getPayoutsByLecturerId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    lecturerId: Joi.number().required().positive(),
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

const updateLecturerPayout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const paramsCondition = Joi.object({
    id: Joi.number().required().positive(),
  });

  const bodyCondition = Joi.object({
    transactionId: Joi.number().optional().positive(),
    payoutAccountId: Joi.number().optional().positive(),
    currency: Joi.string().optional(),
    amount: Joi.number().optional().positive(),
    payoutMethod: Joi.string().optional(),
    status: Joi.string().optional().valid("success", "failed"),
  });

  try {
    await paramsCondition.validateAsync(req.params, { abortEarly: false });
    await bodyCondition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error: any) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message),
    );
  }
};

const updatePayoutStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const paramsCondition = Joi.object({
    id: Joi.number().required().positive(),
  });

  const bodyCondition = Joi.object({
    status: Joi.string().required().valid("success", "failed"),
  });

  try {
    await paramsCondition.validateAsync(req.params, { abortEarly: false });
    await bodyCondition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error: any) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message),
    );
  }
};

const deleteLecturerPayout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    id: Joi.number().required().positive(),
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

export const lecturerPayoutValidation = {
  createLecturerPayout,
  getLecturerPayoutById,
  getPayoutsByLecturerId,
  updateLecturerPayout,
  updatePayoutStatus,
  deleteLecturerPayout,
};
