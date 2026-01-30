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
    // 1. Lấy thông tin User từ biến req 
    const user = (req as any).user; 

    // 2. Kiểm tra bảo mật
    if (!user || !user.id) {
       res.status(StatusCodes.UNAUTHORIZED).json({ message: "Bạn chưa đăng nhập!" });
       return; 
    }

    // 3. Lấy ID chính chủ
    const lecturerId = Number(user.id);

    // 4. Gọi Service
    const data = await dashboardLecturerService.getLecturerStats(lecturerId);
    res.status(StatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
};

const getLecturerCharts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Lấy thông tin User từ Token
    const user = (req as any).user;

    // 2. Kiểm tra bảo mật
    if (!user || !user.id) {
       res.status(StatusCodes.UNAUTHORIZED).json({ message: "Bạn chưa đăng nhập!" });
       return;
    }

    const lecturerId = Number(user.id);
    const { period } = req.query;

    // 3. Gọi Service
    const data = await dashboardLecturerService.getLecturerCharts(lecturerId, period as string);
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