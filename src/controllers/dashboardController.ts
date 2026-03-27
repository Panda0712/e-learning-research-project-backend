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
  const userId = Number(req.jwtDecoded?.id);
  const userRole = String(req.jwtDecoded?.role || "").toLowerCase();

  if (!userId) throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized!");

  try {
    const data = await dashboardService.getAdminStats({ userId, userRole });
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
  const userId = Number(req.jwtDecoded?.id);
  const userRole = String(req.jwtDecoded?.role || "").toLowerCase();

  if (!userId) throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized!");

  try {
    const period = (req.query.period as string) || "this_year";
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;

    const data = await dashboardService.getAdminCharts(
      { userId, userRole },
      period,
      from,
      to,
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
    const userId = Number(req.jwtDecoded?.id);
    const userRole = String(req.jwtDecoded?.role || "").toLowerCase();

    if (!userId) throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized!");

    const data = await dashboardService.getLecturerStats({
      lecturerId: userId,
      userRole,
    });
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
    const userId = Number(req.jwtDecoded?.id);
    const userRole = String(req.jwtDecoded?.role || "").toLowerCase();

    if (!userId) throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized!");

    const period = (req.query.period as string) || "this_year";
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;

    const data = await dashboardService.getLecturerCharts(
      { lecturerId: userId, userRole },
      period,
      from,
      to,
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
