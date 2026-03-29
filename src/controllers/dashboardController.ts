import { dashboardService } from "@/services/dashboardService.js";
import { enrollmentService } from "@/services/enrollmentService.js";
import { orderItemService } from "@/services/orderItemService.js";
import ApiError from "@/utils/ApiError.js";
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from "@/utils/constants.js";
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

const getCourseCustomers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const lecturerId = Number(req.jwtDecoded?.id);
    const courseId = Number(req.params.courseId);
    const page = Number(req.query.page) || DEFAULT_PAGE;
    const itemsPerPage =
      Number(req.query.itemsPerPage) || DEFAULT_ITEMS_PER_PAGE;
    const q = (req.query.q as string) || "";

    const result = await enrollmentService.getStudentsByLecturerIdAndCourseIdV2(
      lecturerId,
      courseId,
      { page, itemsPerPage, q },
    );

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getCourseCommissions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const lecturerId = Number(req.jwtDecoded?.id);
    const courseId = Number(req.params.courseId);
    const page = Number(req.query.page) || DEFAULT_PAGE;
    const itemsPerPage =
      Number(req.query.itemsPerPage) || DEFAULT_ITEMS_PER_PAGE;
    const q = (req.query.q as string) || "";
    const period = (req.query.period as string) || "all";

    const result = await orderItemService.getCommissionsByLecturerAndCourseId(
      lecturerId,
      courseId,
      { page, limit: itemsPerPage, q, period },
    );

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const dashboardController = {
  getAdminOverview,
  getAdminCharts,
  getLecturerOverview,
  getLecturerCharts,
  getCourseCustomers,
  getCourseCommissions,
};
