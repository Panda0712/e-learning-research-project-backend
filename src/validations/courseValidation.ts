import ApiError from "@/utils/ApiError.js";
import { COURSE_STATUS } from "@/utils/constants.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";

const toValidationMessage = (error: any) => {
  const details = error?.details;
  if (Array.isArray(details) && details.length > 0) {
    return details
      .map((item: any) => item?.message)
      .filter(Boolean)
      .join("; ");
  }
  return error?.message || "Validation failed";
};

const validateOrNext = async (
  schema: Joi.ObjectSchema,
  payload: unknown,
  next: NextFunction,
  options?: Joi.AsyncValidationOptions,
) => {
  try {
    await schema.validateAsync(payload, { abortEarly: false, ...options });
    next();
  } catch (error: any) {
    next(
      new ApiError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        toValidationMessage(error),
      ),
    );
  }
};

const createCourseCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const schema = Joi.object({
    name: Joi.string().required().min(2).max(20).trim().strict(),
    slug: Joi.string().required().min(2).max(30).trim().strict(),
  });

  await validateOrNext(schema, req.body, next);
};

const getCourseFaqByCourseId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const schema = Joi.object({
    courseId: Joi.number().integer().required().positive(),
  });

  await validateOrNext(schema, { courseId: Number(req.params.courseId) }, next);
};

const getCourseFaqById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const schema = Joi.object({
    id: Joi.number().integer().required().positive(),
  });

  await validateOrNext(schema, { id: Number(req.params.id) }, next);
};

const createCourseFaq = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const schema = Joi.object({
    courseId: Joi.number().integer().required().positive(),
    question: Joi.string().required().min(5).max(200).trim().strict(),
    answer: Joi.string().required().min(10).max(1000).trim().strict(),
  });

  await validateOrNext(schema, req.body, next);
};

const createCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const schema = Joi.object({
    categoryId: Joi.number().integer().required().positive(),
    thumbnail: Joi.object({
      publicId: Joi.string().required(),
      fileUrl: Joi.string().required(),
      fileSize: Joi.number().optional(),
      fileType: Joi.string().optional(),
    }).required(),
    introVideo: Joi.object({
      publicId: Joi.string().required(),
      fileUrl: Joi.string().required(),
      fileSize: Joi.number().optional(),
      fileType: Joi.string().optional(),
    }).optional(),
    name: Joi.string().required().min(2).max(50).trim().strict(),
    lecturerName: Joi.string().required().min(2).max(50).trim().strict(),
    duration: Joi.string().required().min(2).max(50).trim().strict(),
    level: Joi.string().required().min(2).max(50).trim().strict(),
    overview: Joi.string().required().min(20).max(500).trim().strict(),
    price: Joi.number().required().min(0),
    status: Joi.string()
      .required()
      .valid(
        COURSE_STATUS.DRAFT,
        COURSE_STATUS.PENDING,
        COURSE_STATUS.PUBLISHED,
        COURSE_STATUS.REJECTED,
      ),
  });

  await validateOrNext(schema, req.body, next);
};

const updateCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const schema = Joi.object({
    thumbnail: Joi.object({
      publicId: Joi.string().required(),
      fileUrl: Joi.string().required(),
      fileSize: Joi.number().optional(),
      fileType: Joi.string().optional(),
    }).optional(),
    introVideo: Joi.object({
      publicId: Joi.string().required(),
      fileUrl: Joi.string().required(),
      fileSize: Joi.number().optional(),
      fileType: Joi.string().optional(),
    }).optional(),
    name: Joi.string().min(2).max(50).trim().strict(),
    lecturerName: Joi.string().min(2).max(50).trim().strict(),
    duration: Joi.string().min(2).max(50).trim().strict(),
    level: Joi.string().min(2).max(50).trim().strict(),
    overview: Joi.string().min(20).max(500).trim().strict(),
    price: Joi.number().min(0).optional(),
    status: Joi.string().valid(
      COURSE_STATUS.DRAFT,
      COURSE_STATUS.PENDING,
      COURSE_STATUS.PUBLISHED,
      COURSE_STATUS.REJECTED,
    ),
  });

  await validateOrNext(schema, req.body, next, { allowUnknown: true });
};

const deleteCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const schema = Joi.object({
    id: Joi.number().integer().required().positive(),
  });

  await validateOrNext(schema, { id: Number(req.params.id) }, next);
};

const approveCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const schema = Joi.object({
    id: Joi.number().integer().required().positive(),
  });

  await validateOrNext(schema, { id: Number(req.params.id) }, next);
};

const rejectCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const schema = Joi.object({
    id: Joi.number().integer().required().positive(),
  });

  await validateOrNext(schema, { id: Number(req.params.id) }, next);
};

const getCourseById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const schema = Joi.object({
    id: Joi.number().integer().required().positive(),
  });

  await validateOrNext(schema, { id: Number(req.params.id) }, next);
};

const getAllCoursesByLecturerId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const schema = Joi.object({
    lecturerId: Joi.number().integer().required().positive(),
  });

  await validateOrNext(
    schema,
    { lecturerId: Number(req.params.lecturerId) },
    next,
  );
};

const getAllCoursesByStudentId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const paramsSchema = Joi.object({
    studentId: Joi.number().integer().required().positive(),
  });

  const querySchema = Joi.object({
    page: Joi.number().integer().required().positive(),
    itemsPerPage: Joi.number().integer().required().positive(),
    q: Joi.string().allow("").optional(),
  });

  await validateOrNext(
    paramsSchema,
    { studentId: Number(req.params.studentId) },
    next,
  );
  await validateOrNext(
    querySchema,
    {
      page: Number(req.query.page),
      itemsPerPage: Number(req.query.itemsPerPage),
      q: req.query.q,
    },
    next,
  );
};

const getListLecturersByStudentId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const paramsSchema = Joi.object({
    studentId: Joi.number().integer().required().positive(),
  });

  const querySchema = Joi.object({
    page: Joi.number().integer().required().positive(),
    itemsPerPage: Joi.number().integer().required().positive(),
    q: Joi.string().allow("").optional(),
  });

  await validateOrNext(
    paramsSchema,
    { studentId: Number(req.params.studentId) },
    next,
  );
  await validateOrNext(
    querySchema,
    {
      page: Number(req.query.page),
      itemsPerPage: Number(req.query.itemsPerPage),
      q: req.query.q,
    },
    next,
  );
};

const getAllCoursesByCategoryId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const schema = Joi.object({
    categoryId: Joi.number().integer().required().positive(),
  });

  await validateOrNext(
    schema,
    { categoryId: Number(req.params.categoryId) },
    next,
  );
};

const getListCourses = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const schema = Joi.object({
    page: Joi.number().integer().required().positive(),
    itemsPerPage: Joi.number().integer().required().positive(),
    q: Joi.string().allow("").optional(),
    categoryId: Joi.number().integer().positive().optional(),
    level: Joi.string().allow("").optional(),
    price: Joi.string().valid("all", "free", "paid").optional(),
  });

  await validateOrNext(
    schema,
    {
      page: Number(req.query.page),
      itemsPerPage: Number(req.query.itemsPerPage),
      q: req.query.q,
      categoryId: req.query.categoryId
        ? Number(req.query.categoryId)
        : undefined,
      level: req.query.level,
      price: req.query.price,
    },
    next,
  );
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
