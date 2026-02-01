import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { enrollmentService } from "../services/enrollmentService.js";

const createEnrollment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const enrollment = await enrollmentService.createEnrollment(req.body);

    res.status(StatusCodes.CREATED).json(enrollment);
  } catch (error: any) {
    next(error);
  }
};

const getEnrollmentsByStudentId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { studentId } = req.params;

    const enrollments = await enrollmentService.getEnrollmentsByStudentId(
      Number(studentId),
    );

    res.status(StatusCodes.OK).json(enrollments);
  } catch (error) {
    next(error);
  }
};

export const enrollmentController = {
  createEnrollment,
  getEnrollmentsByStudentId,
};
