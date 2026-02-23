import { lecturerPayoutService } from "@/services/lecturerPayoutService.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const createLecturerPayout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const newPayout = await lecturerPayoutService.createLecturerPayout(
      req.body,
    );
    res.status(StatusCodes.CREATED).json(newPayout);
  } catch (error) {
    next(error);
  }
};

const getLecturerPayoutById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const payout = await lecturerPayoutService.getLecturerPayoutById(
      Number(id),
    );
    res.status(StatusCodes.OK).json(payout);
  } catch (error) {
    next(error);
  }
};

const getAllLecturerPayouts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, lecturerId, status } = req.query;
    const filterParams: any = {};

    if (page) filterParams.page = Number(page);
    if (limit) filterParams.limit = Number(limit);
    if (lecturerId) filterParams.lecturerId = Number(lecturerId);
    if (status) filterParams.status = String(status);

    const payouts = await lecturerPayoutService.getAllLecturerPayouts(
      filterParams,
    );
    res.status(StatusCodes.OK).json(payouts);
  } catch (error) {
    next(error);
  }
};

const getPayoutsByLecturerId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { lecturerId } = req.params;
    const { page, limit, status } = req.query;
    const filterParams: any = { lecturerId: Number(lecturerId) };

    if (page) filterParams.page = Number(page);
    if (limit) filterParams.limit = Number(limit);
    if (status) filterParams.status = String(status);

    const payouts = await lecturerPayoutService.getPayoutsByLecturerId(
      filterParams,
    );
    res.status(StatusCodes.OK).json(payouts);
  } catch (error) {
    next(error);
  }
};

const updateLecturerPayout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const updatedPayout = await lecturerPayoutService.updateLecturerPayout(
      Number(id),
      req.body,
    );
    res.status(StatusCodes.OK).json(updatedPayout);
  } catch (error) {
    next(error);
  }
};

const updatePayoutStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedPayout = await lecturerPayoutService.updatePayoutStatus(
      Number(id),
      status,
    );
    res.status(StatusCodes.OK).json(updatedPayout);
  } catch (error) {
    next(error);
  }
};

const deleteLecturerPayout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await lecturerPayoutService.deleteLecturerPayout(
      Number(id),
    );
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const lecturerPayoutController = {
  createLecturerPayout,
  getLecturerPayoutById,
  getAllLecturerPayouts,
  getPayoutsByLecturerId,
  updateLecturerPayout,
  updatePayoutStatus,
  deleteLecturerPayout,
};
