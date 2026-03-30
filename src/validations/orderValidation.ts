import ApiError from "@/utils/ApiError.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  const correctCondition = Joi.object({
    studentId: Joi.number().required().positive(),
    paymentMethod: Joi.string().optional(),
    couponCode: Joi.string().optional(),
    // Allow items array for PayOS payment
    items: Joi.array()
      .optional()
      .items(
        Joi.object({
          courseId: Joi.number().required().positive(),
          quantity: Joi.number().required().positive(),
          price: Joi.number().required().positive(),
        }),
      ),
  }).unknown(true); // Allow unknown fields

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error: any) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message),
    );
  }
};

const getOrderById = async (
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

const getOrdersByStudentId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    studentId: Joi.number().integer().required().positive(),
  });

  const queryCondition = Joi.object({
    page: Joi.number().integer().positive().optional(),
    limit: Joi.number().integer().positive().max(100).optional(),
  });

  try {
    await Promise.all([
      correctCondition.validateAsync(
        { studentId: Number(req.body.studentId) },
        { abortEarly: false },
      ),
      queryCondition.validateAsync(req.query, { abortEarly: false }),
    ]);

    next();
  } catch (error: any) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message),
    );
  }
};

const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const queryCondition = Joi.object({
    page: Joi.number().integer().positive().optional(),
    limit: Joi.number().integer().positive().max(100).optional(),
    status: Joi.string()
      .valid("pending", "paid", "completed", "cancelled")
      .optional(),
  });

  try {
    await queryCondition.validateAsync(req.query, { abortEarly: false });
    next();
  } catch (error: any) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message),
    );
  }
};

const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const paramCondition = Joi.object({
    id: Joi.number().required().positive(),
  });

  const bodyCondition = Joi.object({
    status: Joi.string()
      .required()
      .valid("pending", "paid", "completed", "cancelled"),
  });

  try {
    await paramCondition.validateAsync(
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

const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
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

const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
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

export const orderValidation = {
  createOrder,
  getOrderById,
  getOrdersByStudentId,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
};
