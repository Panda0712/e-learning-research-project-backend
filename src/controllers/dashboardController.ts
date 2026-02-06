import { dashboardService } from "@/services/dashboardService.js";
import ApiError from "@/utils/ApiError.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

// ===========================
// ADMIN DASHBOARD
// ===========================

const getAdminOverview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await dashboardService.getAdminStats();
    res.status(StatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
};

const getAdminCharts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { period, from, to } = req.query;

    const data = await dashboardService.getAdminCharts(
      period as string,
      from as string,
      to as string,
    );

    res.status(StatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
};

// ===========================
// LECTURER DASHBOARD
// ===========================

const getLecturerOverview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.jwtDecoded?.id;
    if (!userId) throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized!");

    const data = await dashboardService.getLecturerStats(Number(userId));
    res.status(StatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
};

const getLecturerCharts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.jwtDecoded?.id;
    if (!userId) throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized!");

    const { period, from, to } = req.query;

    const data = await dashboardService.getLecturerCharts(
      Number(userId),
      period as string,
      from as string,
      to as string,
    );

    res.status(StatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
};

export const dashboardController = {
  getAdminOverview,
  getAdminCharts,
  getLecturerOverview,
  getLecturerCharts,
};
