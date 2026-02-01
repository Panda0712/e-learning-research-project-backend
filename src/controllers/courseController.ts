import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { courseService } from "../services/courseService.js";

const createCourseCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const newCategory = await courseService.createCourseCategory(req.body);
    res.status(StatusCodes.CREATED).json(newCategory);
  } catch (error) {
    next(error);
  }
};

const getAllCourseCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await courseService.getAllCourseCategories();
    res.status(StatusCodes.OK).json(categories);
  } catch (error) {
    next(error);
  }
};

const createCourseFaq = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const newFaq = await courseService.createCourseFaq(req.body);
    res.status(StatusCodes.CREATED).json(newFaq);
  } catch (error) {
    next(error);
  }
};

const getCourseFaqByCourseId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { courseId } = req.params;

    const result = await courseService.getFaqsByCourseId(Number(courseId));

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getCourseFaqById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const result = await courseService.getCourseFaqById(Number(id));

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const courseController = {
  createCourseCategory,
  getAllCourseCategories,
  getCourseFaqById,
  createCourseFaq,
  getCourseFaqByCourseId,
};
