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
    thumbnail: Joi.object({
      publicId: Joi.string().required(),
      fileUrl: Joi.string().required(),
      fileSize: Joi.number().optional(),
      fileType: Joi.string().optional(),
    }),
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
    thumbnail: Joi.object({
      publicId: Joi.string().required(),
      fileUrl: Joi.string().required(),
      fileSize: Joi.number().optional(),
      fileType: Joi.string().optional(),
    }),
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
    await correctCondition.validateAsync(
      { id: Number(req.params.id) },
      { abortEarly: false },
    );

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
    await correctCondition.validateAsync(
      { id: Number(req.params.id) },
      { abortEarly: false },
    );

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
    await correctCondition.validateAsync(
      { id: Number(req.params.id) },
      { abortEarly: false },
    );

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
    await correctCondition.validateAsync(
      { lecturerId: Number(req.params.lecturerId) },
      { abortEarly: false },
    );

    next();
  } catch (error: any) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message),
    );
  }
};

const getAllCoursesByStudentId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    studentId: Joi.number().integer().required().positive(),
  });

  const correctConditionParams = Joi.object({
    page: Joi.number().integer().required().positive(),
    itemsPerPage: Joi.number().integer().required().positive(),
    q: Joi.string().allow("").optional(),
  });

  try {
    const { studentId } = req.params;
    const { page, itemsPerPage, q } = req.query;

    await correctCondition.validateAsync(
      { studentId: Number(studentId) },
      {
        abortEarly: false,
      },
    );
    await correctConditionParams.validateAsync(
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

const getListLecturersByStudentId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    studentId: Joi.number().integer().required().positive(),
  });

  const correctConditionParams = Joi.object({
    page: Joi.number().integer().required().positive(),
    itemsPerPage: Joi.number().integer().required().positive(),
    q: Joi.string().allow("").optional(),
  });

  try {
    const { studentId } = req.params;
    const { page, itemsPerPage, q } = req.query;

    await correctCondition.validateAsync(
      { studentId: Number(studentId) },
      {
        abortEarly: false,
      },
    );
    await correctConditionParams.validateAsync(
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

const getAllCoursesByCategoryId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const correctCondition = Joi.object({
    categoryId: Joi.number().integer().required().positive(),
  });

  try {
    await correctCondition.validateAsync(
      { categoryId: Number(req.params.categoryId) },
      { abortEarly: false },
    );

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
    q: Joi.string().allow("").optional(),
    categoryId: Joi.number().integer().positive().optional(),
    level: Joi.string().allow("").optional(),
    price: Joi.string().valid("all", "free", "paid").optional(),
  });

  try {
    const { page, itemsPerPage, q, categoryId, level, price } = req.query;

    await correctCondition.validateAsync(
      {
        page: Number(page),
        itemsPerPage: Number(itemsPerPage),
        q,
        categoryId: categoryId ? Number(categoryId) : undefined,
        level,
        price,
      },
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
  getListLecturersByStudentId,
  getAllCoursesByStudentId,
  getAllCoursesByCategoryId,
  getAllCoursesByLecturerId,
};
