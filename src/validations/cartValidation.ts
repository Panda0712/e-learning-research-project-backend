import Joi from "joi";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import ApiError from "@/utils/ApiError.js";

const getCartByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    userId: Joi.number().required().positive(),
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

const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  const correctCondition = Joi.object({
    userId: Joi.number().required().positive(),
    courseId: Joi.number().required().positive(),
    price: Joi.number().required().positive(),
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

const removeItem = async (req: Request, res: Response, next: NextFunction) => {
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

export const cartValidation = {
  getCartByUserId,
  addToCart,
  removeItem,
};
