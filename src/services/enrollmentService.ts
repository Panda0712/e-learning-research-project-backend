import ApiError from "@/utils/ApiError.js";
import { prisma } from "../lib/prisma.js";
import { StatusCodes } from "http-status-codes";

const createEnrollment = async (data: { studentId: number; courseId: number }) => {
  try {
    const { studentId, courseId } = data;

    // check enrollment existence
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: Number(studentId),
        courseId: Number(courseId),
      },
    });

    if (existingEnrollment) {
      throw new ApiError(StatusCodes.CONFLICT, "Student already enrolled!");
    }

    // create new enrollment
    const newEnrollment = await prisma.enrollment.create({
      data: {
        studentId: Number(studentId),
        courseId: Number(courseId),
        status: "enrolled",
        progress: 0,
      },
    });

    return newEnrollment;
  } catch (error: any) {
    throw error;
  }
};

const getEnrollmentsByStudentId = async (studentId: number) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: Number(studentId),
      },
      include: {
        course: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return enrollments || [];
  } catch (error: any) {
    throw error;
  }
};

const getStudentsByLecturerId = async (lecturerId: number) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        course: {
          lecturerId: (lecturerId),
        },
      },
      include: {
        student: true, 
        course: true, 
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return enrollments || [];
  } catch (error: any) {
    throw error;
  }
};

export const enrollmentService = {
  createEnrollment,
  getEnrollmentsByStudentId,
  getStudentsByLecturerId,
};