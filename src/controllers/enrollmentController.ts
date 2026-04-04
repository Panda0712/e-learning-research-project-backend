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

const getStudentsByLecturerId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { lecturerId } = req.params;

    const students = await enrollmentService.getStudentsByLecturerId(
      Number(lecturerId),
    );

    res.status(StatusCodes.OK).json(students);
  } catch (error) {
    next(error);
  }
};

const updateMyEnrollmentProgress = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const studentId = Number(req.jwtDecoded?.id);

    const updated = await enrollmentService.updateEnrollmentProgress(
      studentId,
      {
        courseId: Number(req.body?.courseId),
        progress: Number(req.body?.progress),
      },
    );

    res.status(StatusCodes.OK).json(updated);
  } catch (error) {
    next(error);
  }
};

const getMyEnrollmentProgressByCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const studentId = Number(req.jwtDecoded?.id);
    const { courseId } = req.params;

    const enrollment = await enrollmentService.getEnrollmentProgressByCourse(
      studentId,
      Number(courseId),
    );

    res.status(StatusCodes.OK).json(enrollment);
  } catch (error) {
    next(error);
  }
};

export const enrollmentController = {
  createEnrollment,
  getEnrollmentsByStudentId,
  getStudentsByLecturerId,
  updateMyEnrollmentProgress,
  getMyEnrollmentProgressByCourse,
};
