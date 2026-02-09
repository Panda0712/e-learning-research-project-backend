import ApiError from "@/utils/ApiError.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";

const createQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    quizId: Joi.number().required().positive(),
    question: Joi.string().required().min(2).max(200).trim().strict(),
    type: Joi.string().required().min(2).max(50).trim().strict(),
    options: Joi.array()
      .required()
      .items(Joi.string().min(2).max(200).trim().strict()),
    correctAnswer: Joi.string().required().min(2).max(5000).trim().strict(),
    point: Joi.number().required().positive(),
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

const updateQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    question: Joi.string().min(2).max(200).trim().strict(),
    type: Joi.string().min(2).max(50).trim().strict(),
    options: Joi.array().items(Joi.string().min(2).max(200).trim().strict()),
    correctAnswer: Joi.string().min(2).max(200).trim().strict(),
    point: Joi.number().positive(),
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

const deleteQuestion = async (
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

const getQuestionById = async (
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

const getAllQuestionsByQuizId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    quizId: Joi.number().required().positive(),
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

export const questionValidation = {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionById,
  getAllQuestionsByQuizId,
};
