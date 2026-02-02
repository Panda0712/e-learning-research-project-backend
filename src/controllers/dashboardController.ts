import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { dashboardService } from "@/services/dashboardService.js"; 
import { dashboardValidation } from "@/validations/dashboardValidation.js";
import ApiError from "@/utils/ApiError.js";

// --- HELPER: VALIDATE QUERY PARAMS ---
const validateQuery = (schema: any, query: any) => {
  const { error } = schema.validate(query, { abortEarly: false });
  if (error) {
    const errorMessage = error.details.map((detail: any) => detail.message).join(", ");
    throw new ApiError(StatusCodes.BAD_REQUEST, errorMessage);
  }
};

// ===========================
// ADMIN DASHBOARD
// ===========================

// 1. Tổng quan
const getOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // validateQuery(dashboardValidation.getGeneralStats, req.query);

    const data = await dashboardService.getAdminStats();
    res.status(StatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
};

// 2. Biểu đồ Admin
const getCharts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate đầu vào
    validateQuery(dashboardValidation.getRevenueChart, req.query);

    const { period, from, to } = req.query;

    const data = await dashboardService.getAdminCharts(
      period as string, 
      from as string, 
      to as string
    );
    
    res.status(StatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
};

// ===========================
// LECTURER DASHBOARD
// ===========================

// 3. Tổng quan Giảng viên
const getLecturerOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) throw new ApiError(StatusCodes.UNAUTHORIZED, "Bạn chưa đăng nhập!");

    const data = await dashboardService.getLecturerStats(Number(user.id));
    res.status(StatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
};

// 4. Biểu đồ Giảng viên
const getLecturerCharts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) throw new ApiError(StatusCodes.UNAUTHORIZED, "Bạn chưa đăng nhập!");

    validateQuery(dashboardValidation.getRevenueChart, req.query);

    const { period, from, to } = req.query;

    const data = await dashboardService.getLecturerCharts(
        Number(user.id), 
        period as string, 
        from as string, 
        to as string
    );
    
    res.status(StatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
};

export const dashboardController = { 
  getOverview, 
  getCharts, 
  getLecturerOverview, 
  getLecturerCharts 
};