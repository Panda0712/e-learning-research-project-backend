import ApiError from "@/utils/ApiError.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";

const createResource = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    publicId: Joi.string().required().min(2).max(50).trim().strict(),
    fileSize: Joi.number().optional().positive(),
    fileType: Joi.string().optional().min(2).max(50).trim().strict(),
    fileUrl: Joi.string().required().min(2).max(200).trim().strict(),
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

const getResourceById = async (
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

const getResourceByPublicId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    publicId: Joi.string().required().min(2).max(50).trim().strict(),
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

const getAllResourcesByFileType = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    fileType: Joi.string().required().min(2).max(50).trim().strict(),
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

const deleteResource = async (
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

const deleteResourceByPublicId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    publicId: Joi.string().required().min(2).max(50).trim().strict(),
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

export const resourceValidation = {
  createResource,
  getResourceById,
  getResourceByPublicId,
  getAllResourcesByFileType,
  deleteResource,
  deleteResourceByPublicId,
};
