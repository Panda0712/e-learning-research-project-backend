import { courseReviewService } from "@/services/courseReviewService.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const createCourseReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const newReview = await courseReviewService.createCourseReview(req.body);
    res.status(StatusCodes.CREATED).json(newReview);
  } catch (error) {
    next(error);
  }
};

const getCourseReviewById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const review = await courseReviewService.getCourseReviewById(Number(id));
    res.status(StatusCodes.OK).json(review);
  } catch (error) {
    next(error);
  }
};

const getAllCourseReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, courseId, studentId, rating } = req.query;
    const filterParams: any = {};

    if (page) filterParams.page = Number(page);
    if (limit) filterParams.limit = Number(limit);
    if (courseId) filterParams.courseId = Number(courseId);
    if (studentId) filterParams.studentId = Number(studentId);
    if (rating) filterParams.rating = Number(rating);

    const reviews = await courseReviewService.getAllCourseReviews(filterParams);
    res.status(StatusCodes.OK).json(reviews);
  } catch (error) {
    next(error);
  }
};

const getReviewsByCourseId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { courseId } = req.params;
    const { page, limit, rating } = req.query;
    const filterParams: any = { courseId: Number(courseId) };

    if (page) filterParams.page = Number(page);
    if (limit) filterParams.limit = Number(limit);
    if (rating) filterParams.rating = Number(rating);

    const reviews = await courseReviewService.getReviewsByCourseId(
      filterParams,
    );
    res.status(StatusCodes.OK).json(reviews);
  } catch (error) {
    next(error);
  }
};

const getReviewsByStudentId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { studentId } = req.params;
    const { page, limit } = req.query;
    const filterParams: any = { studentId: Number(studentId) };

    if (page) filterParams.page = Number(page);
    if (limit) filterParams.limit = Number(limit);

    const reviews = await courseReviewService.getReviewsByStudentId(
      filterParams,
    );
    res.status(StatusCodes.OK).json(reviews);
  } catch (error) {
    next(error);
  }
};

const updateCourseReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const updatedReview = await courseReviewService.updateCourseReview(
      Number(id),
      req.body,
    );
    res.status(StatusCodes.OK).json(updatedReview);
  } catch (error) {
    next(error);
  }
};

const deleteCourseReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await courseReviewService.deleteCourseReview(Number(id));
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const courseReviewController = {
  createCourseReview,
  getCourseReviewById,
  getAllCourseReviews,
  getReviewsByCourseId,
  getReviewsByStudentId,
  updateCourseReview,
  deleteCourseReview,
};
