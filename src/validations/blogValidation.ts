import Joi from "joi";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import ApiError from "@/utils/ApiError.js";

const createBlogCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    name: Joi.string().required().min(2).max(50).trim().strict(),
    slug: Joi.string()
      .required()
      .min(2)
      .max(50)
      .trim()
      .lowercase()
      .pattern(/^[a-z0-9-]+$/)
      .message("Slug must be lowercase and alphanumeric"),
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

const deleteBlogCategory = async (
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

export const blogValidation = {
  createBlogCategory,
  deleteBlogCategory,
};
