import ApiError from "@/utils/ApiError.js";
import { prisma } from "../lib/prisma.js";
import { StatusCodes } from "http-status-codes";

const createEnrollment = async (data: {
  studentId: number;
  courseId: number;
}) => {
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

const getStudentsByLecturerIdAndCourseId = async (
  lecturerId: number,
  courseId: number,
) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId, isDestroyed: false },
  });

  if (!course) throw new ApiError(StatusCodes.NOT_FOUND, "Course not found!");
  if (course.lecturerId !== lecturerId) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You are not allowed.");
  }

  const enrollments = await prisma.enrollment.findMany({
    where: {
      courseId,
      course: { lecturerId },
      isDestroyed: false,
    },
    include: {
      student: { include: { avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return enrollments.map((item) => ({
    id: item.id,
    name: `${item.student.firstName} ${item.student.lastName}`.trim(),
    country: "Unknown",
    joinedDate: item.createdAt,
    progress: Number(item.progress || 0),
  }));
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
          lecturerId: lecturerId,
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
  getStudentsByLecturerIdAndCourseId,
};
