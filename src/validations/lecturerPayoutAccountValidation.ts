import ApiError from "@/utils/ApiError.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";

const createLecturerPayoutAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    lecturerId: Joi.number().required().positive(),
    cardType: Joi.string().optional(),
    cardNumber: Joi.string().optional(),
    cardExpireDate: Joi.date().optional(),
    cardCVV: Joi.number().optional().positive().max(9999),
    cardHolderName: Joi.string().optional(),
    isDefault: Joi.boolean().optional(),
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

const getLecturerPayoutAccountById = async (
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

const getPayoutAccountsByLecturerId = async (
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

const getDefaultPayoutAccount = async (
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

const updateLecturerPayoutAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const paramsCondition = Joi.object({
    id: Joi.number().required().positive(),
  });

  const bodyCondition = Joi.object({
    cardType: Joi.string().optional(),
    cardNumber: Joi.string().optional(),
    cardExpireDate: Joi.date().optional(),
    cardCVV: Joi.number().optional().positive().max(9999),
    cardHolderName: Joi.string().optional(),
    isDefault: Joi.boolean().optional(),
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

const setDefaultPayoutAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const paramsCondition = Joi.object({
    id: Joi.number().required().positive(),
  });

  const bodyCondition = Joi.object({
    lecturerId: Joi.number().required().positive(),
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

const deleteLecturerPayoutAccount = async (
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

export const lecturerPayoutAccountValidation = {
  createLecturerPayoutAccount,
  getLecturerPayoutAccountById,
  getPayoutAccountsByLecturerId,
  getDefaultPayoutAccount,
  updateLecturerPayoutAccount,
  setDefaultPayoutAccount,
  deleteLecturerPayoutAccount,
};
