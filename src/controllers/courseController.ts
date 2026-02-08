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

const createCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.jwtDecoded.id;

    const createdCourse = await courseService.createCourse({
      ...req.body,
      lecturerId: Number(id),
    });

    res.status(StatusCodes.CREATED).json(createdCourse);
  } catch (error) {
    next(error);
  }
};

const updateCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const updatedCourse = await courseService.updateCourse(
      Number(id),
      req.body,
    );

    res.status(StatusCodes.OK).json(updatedCourse);
  } catch (error) {
    next(error);
  }
};

const deleteCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    await courseService.deleteCourse(Number(id));

    res.status(StatusCodes.OK).json({ message: "Course deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const approveCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    await courseService.approveCourse(Number(id));

    res
      .status(StatusCodes.OK)
      .json({ message: "Course approved successfully" });
  } catch (error) {
    next(error);
  }
};

const rejectCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    await courseService.rejectCourse(Number(id));

    res
      .status(StatusCodes.OK)
      .json({ message: "Course rejected successfully" });
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

  createCourse,
  updateCourse,
  deleteCourse,
  approveCourse,
  rejectCourse,
};
