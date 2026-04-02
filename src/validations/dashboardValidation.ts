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
    period: Joi.string()
      .valid("all_time", "last_month", "this_month", "this_year", "custom")
      .optional(),
    from: Joi.date().iso().optional(),
    to: Joi.date().iso().optional(),
  }).custom((value, helpers) => {
    const period = value.period || "this_year";

    if (period === "custom" && (!value.from || !value.to)) {
      return helpers.error("any.custom", {
        message: "From and to dates are required for custom period",
      });
    }

    return value;
  });

  try {
    const validated = await correctCondition.validateAsync(req.query, {
      abortEarly: false,
    });

    req.query = {
      ...req.query,
      ...validated,
      period: (validated.period as string | undefined) ?? "this_year",
    };

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

const getCourseCustomers = async (
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
    q: Joi.string().optional(),
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

const getCourseCommissions = async (
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
    q: Joi.string().allow("").optional(),
    period: Joi.string()
      .valid("all", "last-month", "this-month", "this-year")
      .optional(),
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

export const dashboardValidation = {
  getGeneralStats,
  getRevenueChart,
  getTopRanking,
  getCourseCustomers,
  getCourseCommissions,
};
