import { homepageService } from "@/services/homepageService.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const getHomepageData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const popularLimit = Number(req.query.popularLimit) || 6;
    const reviewLimit = Number(req.query.reviewLimit) || 3;

    const data = await homepageService.getHomepageData({
      popularLimit,
      reviewLimit,
    });

    res.status(StatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
};

export const homepageController = {
  getHomepageData,
};
