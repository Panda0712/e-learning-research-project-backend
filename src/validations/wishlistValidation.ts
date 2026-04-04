import ApiError from "@/utils/ApiError.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi, { number } from "joi";

const createWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    courseId: Joi.number().required().positive(),
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

const getWishlistById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    id: Joi.number().required().positive(),
  });

  try {
    await correctCondition.validateAsync(
      {
        id: Number(req.params.id),
      },
      { abortEarly: false },
    );
    next();
  } catch (error: any) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message),
    );
  }
};

const getWishlistsByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    userId: Joi.number().required().positive(),
  });

  try {
    await correctCondition.validateAsync(
      {
        userId: Number(req.params.userId),
      },
      { abortEarly: false },
    );
    next();
  } catch (error: any) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message),
    );
  }
};

const checkCourseInWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    courseId: Joi.number().required().positive(),
  });

  try {
    await correctCondition.validateAsync(
      {
        courseId: Number(req.params.courseId),
      },
      { abortEarly: false },
    );
    next();
  } catch (error: any) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message),
    );
  }
};

const updateWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const paramsCondition = Joi.object({
    id: Joi.number().required().positive(),
  });

  const bodyCondition = Joi.object({
    courseThumbnail: Joi.string().optional(),
    courseName: Joi.string().optional(),
    lecturer: Joi.string().optional(),
  });

  try {
    await paramsCondition.validateAsync(
      {
        id: Number(req.params.id),
      },
      { abortEarly: false },
    );
    await bodyCondition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error: any) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message),
    );
  }
};

const deleteWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    id: Joi.number().required().positive(),
  });

  try {
    await correctCondition.validateAsync(
      {
        id: Number(req.params.id),
      },
      { abortEarly: false },
    );
    next();
  } catch (error: any) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message),
    );
  }
};

const deleteWishlistByCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    userId: Joi.number().required().positive(),
    courseId: Joi.number().required().positive(),
  });

  try {
    await correctCondition.validateAsync(
      {
        userId: Number(req.params.userId),
        courseId: Number(req.params.courseId),
      },
      { abortEarly: false },
    );
    next();
  } catch (error: any) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message),
    );
  }
};

const deleteMyWishlistByCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    courseId: Joi.number().required().positive(),
  });

  try {
    await correctCondition.validateAsync(
      {
        courseId: Number(req.params.courseId),
      },
      { abortEarly: false },
    );
    next();
  } catch (error: any) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message),
    );
  }
};

export const wishlistValidation = {
  createWishlist,
  getWishlistById,
  getWishlistsByUserId,
  checkCourseInWishlist,
  updateWishlist,
  deleteWishlist,
  deleteWishlistByCourse,
  deleteMyWishlistByCourse,
};
