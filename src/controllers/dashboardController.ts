import { dashboardAdminService } from "@/services/dashboardAdminService.js";
import { dashboardLecturerService } from "@/services/dashboardLecturerService.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

// --- ADMIN ---
// API 1: Lấy số liệu tổng quan (Cards + List)
const getOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dashboardAdminService.getAdminStats();
    res.status(StatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
};

// API 2: Lấy dữ liệu biểu đồ (Có bộ lọc thời gian)
const getCharts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Lấy tham số từ URL
    const { period, from, to } = req.query;

    const data = await dashboardAdminService.getCharts(
      period as string, 
      from as string, 
      to as string
    );
    
    res.status(StatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
};

// --- LECTURER ---

const getLecturerOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Giả sử cậu đã có middleware xác thực gán user vào req.user
    // const lecturerId = req.user.id; 
    // Tạm thời tớ lấy từ query để cậu test, sau này nhớ đổi sang req.user.id nhé
    const lecturerId = Number(req.query.lecturerId) || 1; 

    const data = await dashboardLecturerService.getLecturerStats(lecturerId);
    res.status(StatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
};

const getLecturerCharts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lecturerId = Number(req.query.lecturerId) || 1; // Nhớ đổi sang req.user.id khi chạy thật
    const { period } = req.query;

    const data = await dashboardLecturerService.getLecturerCharts(lecturerId, period as string);
    res.status(StatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
};

export const dashboardController = { getOverview, getCharts, getLecturerOverview, getLecturerCharts };