import ApiError from "@/utils/ApiError.js";
import { DEGREE_OPTIONS, GENDER_SELECT } from "@/utils/constants.js";
import {
  EMAIL_RULE,
  EMAIL_RULE_MESSAGE,
  PASSWORD_RULE,
  PASSWORD_RULE_MESSAGE,
  PHONE_RULE,
  PHONE_RULE_MESSAGE,
} from "@/utils/validators.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    firstName: Joi.string().required().min(2).max(20).trim().strict(),
    lastName: Joi.string().required().min(2).max(40).trim().strict(),
    email: Joi.string()
      .required()
      .pattern(EMAIL_RULE)
      .message(EMAIL_RULE_MESSAGE),
    password: Joi.string()
      .required()
      .pattern(PASSWORD_RULE)
      .message(PASSWORD_RULE_MESSAGE),
  });

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error: any) {
    new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message);
  }
};

export const verifyAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    email: Joi.string()
      .required()
      .pattern(EMAIL_RULE)
      .message(EMAIL_RULE_MESSAGE),
    token: Joi.string().required(),
  });

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false });

    next();
  } catch (error: any) {
    new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    email: Joi.string()
      .required()
      .pattern(EMAIL_RULE)
      .message(EMAIL_RULE_MESSAGE),
    password: Joi.string()
      .required()
      .pattern(PASSWORD_RULE)
      .message(PASSWORD_RULE_MESSAGE),
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

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    firstName: Joi.string().min(2).max(20).trim().strict(),
    lastName: Joi.string().min(2).max(40).trim().strict(),
    email: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    dateOfBirth: Joi.date().timestamp("javascript").default(null),
    phoneNumber: Joi.string().pattern(PHONE_RULE).message(PHONE_RULE_MESSAGE),
    currentPassword: Joi.string()
      .pattern(PASSWORD_RULE)
      .message(`current password: ${PASSWORD_RULE_MESSAGE}`),
    newPassword: Joi.string()
      .pattern(PASSWORD_RULE)
      .message(`new password: ${PASSWORD_RULE_MESSAGE}`),
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

export const registerLecturer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    firstName: Joi.string().required().min(2).max(20).trim().strict(),
    lastName: Joi.string().required().min(2).max(40).trim().strict(),
    dateOfBirth: Joi.date().required().timestamp("javascript").default(null),
    resourceId: Joi.number().required(),
    phoneNumber: Joi.string()
      .required()
      .pattern(PHONE_RULE)
      .message(PHONE_RULE_MESSAGE),
    gender: Joi.string()
      .required()
      .valid(GENDER_SELECT.MALE, GENDER_SELECT.FEMALE, GENDER_SELECT.OTHER),
    nationality: Joi.string().required(),
    professionalTitle: Joi.string().required().min(5).max(30).trim().strict(),
    beginStudies: Joi.date().required().timestamp("javascript").default(null),
    highestDegree: Joi.string()
      .required()
      .valid(
        DEGREE_OPTIONS.BACHELOR,
        DEGREE_OPTIONS.DOCTORAL,
        DEGREE_OPTIONS.MASTER,
        DEGREE_OPTIONS.ASSOCIATE_PROFESSOR,
        DEGREE_OPTIONS.EMERITUS_PROFESSOR,
        DEGREE_OPTIONS.PHD,
        DEGREE_OPTIONS.PROFESSOR,
      ),
    bio: Joi.string().required(),
  });

  try {
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
    });
    next();
  } catch (error: any) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message),
    );
  }
};

const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    email: Joi.string()
      .required()
      .pattern(EMAIL_RULE)
      .message(EMAIL_RULE_MESSAGE),
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

const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string()
      .required()
      .pattern(PASSWORD_RULE)
      .message(PASSWORD_RULE_MESSAGE),
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

export const userValidation = {
  register,
  verifyAccount,
  login,
  update,
  registerLecturer,
  forgotPassword,
  resetPassword,
};
