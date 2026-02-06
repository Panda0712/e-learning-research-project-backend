import ApiError from "@/utils/ApiError.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";

// 1. Validate for general statistics API
const getGeneralStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    startDate: Joi.date().iso().optional().messages({
      "date.base": "Invalid start date (Format: YYYY-MM-DD)",
      "date.format": "Start date must be in ISO format (YYYY-MM-DD)",
    }),
    endDate: Joi.date().iso().min(Joi.ref("startDate")).optional().messages({
      "date.base": "Invalid end date",
      "date.min": "End date must be greater than or equal to start date",
    }),
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

// 2. Validate for revenue chart
const getRevenueChart = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    period: Joi.string().valid("week", "month", "year").required(),
    from: Joi.date().iso().optional(),
    to: Joi.date().iso().optional(),
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

// 3. Validate for top lecturers and top courses
const getTopRanking = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    limit: Joi.number().integer().min(1).max(20).default(5).optional(),
    sortBy: Joi.string()
      .valid("revenue", "enrollments", "rating")
      .default("revenue")
      .optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref("startDate")).optional(),
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

export const dashboardValidation = {
  getGeneralStats,
  getRevenueChart,
  getTopRanking,
};
