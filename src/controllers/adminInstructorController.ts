import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { adminInstructorService } from "@/services/adminInstructorService.js";

const getAllRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminInstructorService.getAllRequests();
    res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    next(error);
  }
};

const approveRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await adminInstructorService.approveRequest(Number(id));
    res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    next(error);
  }
};

const rejectRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await adminInstructorService.rejectRequest(Number(id));
    res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const adminInstructorController = {
  getAllRequests,
  approveRequest,
  rejectRequest,
};