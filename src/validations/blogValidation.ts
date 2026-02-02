import ApiError from "@/utils/ApiError.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";

// CATEGORY VALIDATION
const createBlogCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    name: Joi.string().required().min(2).max(50).trim().strict(),
    slug: Joi.string()
      .required()
      .min(2)
      .max(50)
      .trim()
      .lowercase()
      .pattern(/^[a-z0-9-]+$/)
      .message("Slug must be lowercase and alphanumeric"),
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

const updateBlogCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    name: Joi.string().required().min(2).max(50).trim().strict(),
    slug: Joi.string()
      .required()
      .min(2)
      .max(50)
      .trim()
      .lowercase()
      .pattern(/^[a-z0-9-]+$/)
      .message("Slug must be lowercase and alphanumeric"),
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

const deleteBlogCategory = async (
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

// POST VALIDATION
const createPost = async (req: Request, res: Response, next: NextFunction) => {
  const correctCondition = Joi.object({
    title: Joi.string().required().min(2).max(50).trim().strict(),
    slug: Joi.string()
      .required()
      .min(2)
      .max(50)
      .trim()
      .lowercase()
      .pattern(/^[a-z0-9-]+$/)
      .message("Slug must be lowercase and alphanumeric"),
    content: Joi.string().required().min(2).max(5000).trim().strict(),
    thumbnail: Joi.string().uri().optional().allow(null, ""),
    categoryId: Joi.number().required().positive(),
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

const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  const correctCondition = Joi.object({
    title: Joi.string().required().min(2).max(50).trim().strict(),
    content: Joi.string().required().min(2).max(5000).trim().strict(),
    thumbnail: Joi.string().uri().optional().allow(null, ""),
    categoryId: Joi.number().required().positive(),
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

const deletePost = async (req: Request, res: Response, next: NextFunction) => {
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

// COMMENT VALIDATION
const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    content: Joi.string().required().min(2).max(5000).trim().strict(),
    blogId: Joi.number().required().positive(),
    parentId: Joi.number().integer().optional().allow(null),
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

const updateComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    content: Joi.string().required().min(2).max(5000).trim().strict(),
    blogId: Joi.number().required().positive(),
    parentId: Joi.number().integer().optional().allow(null),
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

const deleteComment = async (
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

export const blogValidation = {
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,

  createPost,
  updatePost,
  deletePost,

  createComment,
  updateComment,
  deleteComment,
};
