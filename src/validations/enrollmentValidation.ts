import ApiError from "@/utils/ApiError.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";

const createEnrollment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    studentId: Joi.number().integer().required().positive(),
    courseId: Joi.number().integer().required().positive(),
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

const getEnrollmentsByStudentId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    studentId: Joi.number().integer().required().positive(),
  });

  try {
    await correctCondition.validateAsync(
      {
        studentId: Number(req.params.studentId),
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

const getStudentsByLecturerId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    lecturerId: Joi.number().integer().required().positive(),
  });

  try {
    await correctCondition.validateAsync(
      {
        lecturerId: Number(req.params.lecturerId),
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

export const enrollmentValidation = {
  createEnrollment,
  getEnrollmentsByStudentId,
  getStudentsByLecturerId,
};
