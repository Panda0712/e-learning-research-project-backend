import ApiError from "@/utils/ApiError.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";

// ============ COUPON CATEGORY VALIDATIONS ============

const createCouponCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    name: Joi.string().required().min(3).max(255),
    slug: Joi.string().required().min(3).max(255),
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

const getCouponCategoryById = async (
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

const updateCouponCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    id: Joi.number().required().positive().integer(),
  });

  const bodyCondition = Joi.object({
    name: Joi.string().optional().min(3).max(255),
    slug: Joi.string().optional().min(3).max(255),
  });

  try {
    await correctCondition.validateAsync(
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

const deleteCouponCategory = async (
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

// ============ COUPON VALIDATIONS ============

const createCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    name: Joi.string().required().min(2).max(100).trim().strict(),
    description: Joi.string().allow("").optional(),
    status: Joi.string().valid("active", "expired", "scheduled").required(),
    code: Joi.string().required().min(2).max(100).trim().strict(),
    categoryId: Joi.number().integer().positive().optional(),
    discount: Joi.number().optional().min(0),
    amount: Joi.number().optional().min(0),
    discountUnit: Joi.string().valid("amount", "percent").optional(),
    usageLimit: Joi.number().integer().optional().min(0),
    minOrderValue: Joi.number().optional().min(0),
    maxValue: Joi.number().optional().min(0),
    startingDate: Joi.date().optional(),
    startingTime: Joi.string().allow("").optional(),
    endingDate: Joi.date().optional(),
    endingTime: Joi.string().allow("").optional(),
  }).or("discount", "amount");

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

const getCouponById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    id: Joi.number().required().positive().integer(),
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

const getCouponByCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    code: Joi.string().required().min(3).max(255),
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

const updateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const paramCondition = Joi.object({
    id: Joi.number().required().positive().integer(),
  });

  const bodyCondition = Joi.object({
    name: Joi.string().min(2).max(100).trim().strict(),
    description: Joi.string().allow(""),
    status: Joi.string().valid("active", "expired", "scheduled"),
    code: Joi.string().min(2).max(100).trim().strict(),
    categoryId: Joi.number().integer().positive(),
    discount: Joi.number().min(0),
    amount: Joi.number().min(0),
    discountUnit: Joi.string().valid("amount", "percent"),
    usageLimit: Joi.number().integer().min(0),
    minOrderValue: Joi.number().min(0),
    maxValue: Joi.number().min(0),
    startingDate: Joi.date(),
    startingTime: Joi.string().allow(""),
    endingDate: Joi.date(),
    endingTime: Joi.string().allow(""),
  });

  try {
    await paramCondition.validateAsync(
      {
        id: Number(req.params.id),
      },
      { abortEarly: false },
    );
    await bodyCondition.validateAsync(req.body, {
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

const deleteCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    id: Joi.number().required().positive().integer(),
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

const verifyCouponCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    code: Joi.string().required().min(3).max(255),
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

export const couponValidation = {
  // Category validations
  createCouponCategory,
  getCouponCategoryById,
  updateCouponCategory,
  deleteCouponCategory,
  // Coupon validations
  createCoupon,
  getCouponById,
  getCouponByCode,
  updateCoupon,
  deleteCoupon,
  verifyCouponCode,
};
