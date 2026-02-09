import ApiError from "@/utils/ApiError.js";
import { COURSE_STATUS } from "@/utils/constants.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";

const createCourseCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    name: Joi.string().required().min(2).max(20).trim().strict(),
    slug: Joi.string().required().min(2).max(30).trim().strict(),
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

const getCourseFaqByCourseId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    courseId: Joi.number().integer().required().positive(),
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

const getCourseFaqById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    id: Joi.number().integer().required().positive(),
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

const createCourseFaq = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    courseId: Joi.number().integer().required().positive(),
    question: Joi.string().required().min(2).max(50).trim().strict(),
    answer: Joi.string().required().min(2).max(100).trim().strict(),
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

const createCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    categoryId: Joi.number().integer().required().positive(),
    thumbnail: Joi.string(),
    name: Joi.string().required().min(2).max(50).trim().strict(),
    lecturerName: Joi.string().required().min(2).max(50).trim().strict(),
    duration: Joi.string().required().min(2).max(50).trim().strict(),
    level: Joi.string().required().min(2).max(50).trim().strict(),
    overview: Joi.string().required().min(2).max(50).trim().strict(),
    price: Joi.number().integer().required().positive(),
    status: Joi.string()
      .required()
      .valid(
        COURSE_STATUS.DRAFT,
        COURSE_STATUS.PENDING,
        COURSE_STATUS.PUBLISHED,
        COURSE_STATUS.REJECTED,
      ),
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

const updateCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    thumbnail: Joi.string(),
    name: Joi.string().min(2).max(50).trim().strict(),
    lecturerName: Joi.string().min(2).max(50).trim().strict(),
    duration: Joi.string().min(2).max(50).trim().strict(),
    level: Joi.string().min(2).max(50).trim().strict(),
    overview: Joi.string().min(2).max(50).trim().strict(),
    price: Joi.number().integer().positive(),
    status: Joi.string().valid(
      COURSE_STATUS.DRAFT,
      COURSE_STATUS.PENDING,
      COURSE_STATUS.PUBLISHED,
      COURSE_STATUS.REJECTED,
    ),
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

const deleteCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    id: Joi.number().integer().required().positive(),
  });

  try {
    await correctCondition.validateAsync(req.params, {
      abortEarly: false,
    });

    next();
  } catch (error: any) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message),
    );
  }
};

const approveCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    id: Joi.number().integer().required().positive(),
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

const rejectCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    id: Joi.number().integer().required().positive(),
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

const getCourseById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    id: Joi.number().integer().required().positive(),
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

const getAllCoursesByLecturerId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    lecturerId: Joi.number().integer().required().positive(),
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

const getAllCoursesByCategoryId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    categoryId: Joi.number().integer().required().positive(),
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

const getListCourses = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    page: Joi.number().integer().required().positive(),
    itemsPerPage: Joi.number().integer().required().positive(),
    q: Joi.string().required().min(2).max(50).trim().strict(),
  });

  try {
    const { page, itemsPerPage, q } = req.query;

    await correctCondition.validateAsync(
      { page: Number(page), itemsPerPage: Number(itemsPerPage), q },
      {
        abortEarly: false,
      },
    );

    next();
  } catch (error: any) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message),
    );
  }
};

export const courseValidation = {
  createCourseCategory,

  getCourseFaqByCourseId,
  getCourseFaqById,
  createCourseFaq,

  createCourse,
  updateCourse,
  deleteCourse,
  approveCourse,
  rejectCourse,
  getCourseById,
  getListCourses,
  getAllCoursesByCategoryId,
  getAllCoursesByLecturerId,
};
