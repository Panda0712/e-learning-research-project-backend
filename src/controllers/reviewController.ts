import { reviewService } from "@/services/reviewService.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const getHighlightReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const limit = Number(req.query.limit) || 3;
    const data = await reviewService.getHighlightReviews(limit);
    res.status(StatusCodes.OK).json(data);
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
    const courseId = Number(req.params.courseId);
    const limit = Number(req.query.limit) || 10;
    const data = await reviewService.getReviewsByCourseId(courseId, limit);
    res.status(StatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
};

export const reviewController = {
  getHighlightReviews,
  getReviewsByCourseId,
};
