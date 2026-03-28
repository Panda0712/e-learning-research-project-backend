import { reviewService } from "@/services/reviewService.js";
import { DEFAULT_ITEMS_PER_PAGE } from "@/utils/constants.js";
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

const getReviewsByCourseIdV2 = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Number(req.query.page) || 1;
    const itemsPerPage =
      Number(req.query.itemsPerPage) || DEFAULT_ITEMS_PER_PAGE;
    const courseId = Number(req.params.courseId);
    const limit = Number(req.query.limit) || 10;

    const data = await reviewService.getReviewsByCourseIdV2(
      courseId,
      page,
      itemsPerPage,
      limit,
    );
    res.status(StatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
};

export const reviewController = {
  getHighlightReviews,
  getReviewsByCourseId,
  getReviewsByCourseIdV2,
};
