import ApiError from "@/utils/ApiError.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";

const createLesson = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    resourceId: Joi.number().required().positive(),
    moduleId: Joi.number().required().positive(),
    title: Joi.string().required().min(2).max(200).trim().strict(),
    description: Joi.string().required().min(2).max(5000).trim().strict(),
    note: Joi.string().min(2).max(5000).trim().strict(),
    videoUrl: Joi.string().min(2).max(5000).trim().strict(),
    duration: Joi.string().required().min(2).max(50).trim().strict(),
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

const updateLesson = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    title: Joi.string().min(2).max(200).trim().strict(),
    description: Joi.string().min(2).max(5000).trim().strict(),
    note: Joi.string().min(2).max(5000).trim().strict(),
    videoUrl: Joi.string().min(2).max(5000).trim().strict(),
    duration: Joi.string().min(2).max(50).trim().strict(),
  });

  try {
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });

    next();
  } catch (error: any) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message),
    );
  }
};

const deleteLesson = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    id: Joi.number().required().positive(),
  });

  try {
    await correctCondition.validateAsync(Number(req.params), {
      abortEarly: false,
    });

    next();
  } catch (error: any) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message),
    );
  }
};

const getLessonById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    id: Joi.number().required().positive(),
  });

  try {
    await correctCondition.validateAsync(Number(req.params), {
      abortEarly: false,
    });

    next();
  } catch (error: any) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message),
    );
  }
};

const getAllLessonsByModuleId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    moduleId: Joi.number().required().positive(),
  });

  try {
    await correctCondition.validateAsync(Number(req.params), {
      abortEarly: false,
    });

    next();
  } catch (error: any) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message),
    );
  }
};

const getLessonByResourceId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    resourceId: Joi.number().required().positive(),
  });

  try {
    await correctCondition.validateAsync(Number(req.params), {
      abortEarly: false,
    });

    next();
  } catch (error: any) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message),
    );
  }
};

export const lessonValidation = {
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonById,
  getAllLessonsByModuleId,
  getLessonByResourceId,
};
