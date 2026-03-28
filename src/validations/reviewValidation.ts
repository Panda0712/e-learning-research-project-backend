import ApiError from "@/utils/ApiError.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";

const getHighlightReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    limit: Joi.number().integer().positive().min(1).max(20).default(3),
  });

  try {
    await correctCondition.validateAsync(req.query, { abortEarly: false });
    next();
  } catch (error: any) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message),
    );
  }
};

const getReviewsByCourseId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    courseId: Joi.number().integer().required().positive(),
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

const getReviewsByCourseIdV2 = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    courseId: Joi.number().integer().required().positive(),
  });
  const querySchema = Joi.object({
    page: Joi.number().integer().positive().optional(),
    itemsPerPage: Joi.number().integer().positive().max(100).optional(),
  });

  try {
    await Promise.all([
      correctCondition.validateAsync(
        { courseId: Number(req.params.courseId) },
        { abortEarly: false },
      ),
      querySchema.validateAsync(req.query, { abortEarly: false }),
    ]);
    next();
  } catch (error: any) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message),
    );
  }
};

export const reviewValidation = {
  getHighlightReviews,
  getReviewsByCourseId,
  getReviewsByCourseIdV2,
};
