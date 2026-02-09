import ApiError from "@/utils/ApiError.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";

const createQuiz = async (req: Request, res: Response, next: NextFunction) => {
  const correctCondition = Joi.object({
    lessonId: Joi.number().required().positive(),
    title: Joi.string().required().min(2).max(50).trim().strict(),
    description: Joi.string().required().min(2).max(5000).trim().strict(),
    timeLimit: Joi.number().required().positive(),
    passingScore: Joi.number().required().positive(),
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

const updateQuiz = async (req: Request, res: Response, next: NextFunction) => {
  const correctCondition = Joi.object({
    title: Joi.string().min(2).max(50).trim().strict(),
    description: Joi.string().min(2).max(5000).trim().strict(),
    timeLimit: Joi.number().positive(),
    passingScore: Joi.number().positive(),
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

const deleteQuiz = async (req: Request, res: Response, next: NextFunction) => {
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

const getQuizById = async (req: Request, res: Response, next: NextFunction) => {
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

const getAllQuizzesByLessonId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    lessonId: Joi.number().required().positive(),
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

export const quizValidation = {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizById,
  getAllQuizzesByLessonId,
};
