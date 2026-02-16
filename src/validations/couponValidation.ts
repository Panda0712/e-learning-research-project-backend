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
    await correctCondition.validateAsync(req.params, { abortEarly: false });
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
    id: Joi.number().required().positive(),
  });

  const bodyCondition = Joi.object({
    name: Joi.string().optional().min(3).max(255),
    slug: Joi.string().optional().min(3).max(255),
  });

  try {
    await correctCondition.validateAsync(req.params, { abortEarly: false });
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
    await correctCondition.validateAsync(req.params, { abortEarly: false });
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
    name: Joi.string().required().min(3).max(255),
    description: Joi.string().optional(),
    status: Joi.string().optional().valid("active", "inactive", "draft"),
    customerGroup: Joi.string().optional(),
    code: Joi.string().required().min(3).max(255),
    categoryId: Joi.number().optional().positive(),
    quantity: Joi.number().optional().positive(),
    usesPerCustomer: Joi.number().optional().positive(),
    priority: Joi.string().optional().valid("low", "normal", "high"),
    actions: Joi.string().optional(),
    type: Joi.string().required().valid("percentage", "fixed"),
    amount: Joi.number().required().positive(),
    startingDate: Joi.date().optional(),
    startingTime: Joi.string().optional(),
    endingDate: Joi.date().optional(),
    endingTime: Joi.string().optional(),
    isUnlimited: Joi.boolean().optional(),
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

const getCouponById = async (
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
    id: Joi.number().required().positive(),
  });

  const bodyCondition = Joi.object({
    name: Joi.string().optional().min(3).max(255),
    description: Joi.string().optional(),
    status: Joi.string().optional().valid("active", "inactive", "draft"),
    customerGroup: Joi.string().optional(),
    code: Joi.string().optional().min(3).max(255),
    categoryId: Joi.number().optional().positive(),
    quantity: Joi.number().optional().positive(),
    usesPerCustomer: Joi.number().optional().positive(),
    priority: Joi.string().optional().valid("low", "normal", "high"),
    actions: Joi.string().optional(),
    type: Joi.string().optional().valid("percentage", "fixed"),
    amount: Joi.number().optional().positive(),
    startingDate: Joi.date().optional(),
    startingTime: Joi.string().optional(),
    endingDate: Joi.date().optional(),
    endingTime: Joi.string().optional(),
    isUnlimited: Joi.boolean().optional(),
  });

  try {
    await paramCondition.validateAsync(req.params, { abortEarly: false });
    await bodyCondition.validateAsync(req.body, { abortEarly: false });
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
