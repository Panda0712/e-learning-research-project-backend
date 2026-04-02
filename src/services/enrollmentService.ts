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

const getStudentsByLecturerIdAndCourseIdV2 = async (
  lecturerId: number,
  courseId: number,
  query: { page: number; itemsPerPage: number; q: string },
) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId, isDestroyed: false },
  });

  if (!course) throw new ApiError(StatusCodes.NOT_FOUND, "Course not found!");
  if (course.lecturerId !== lecturerId) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You are not allowed.");
  }

  const skip = (query.page - 1) * query.itemsPerPage;

  const where: any = {
    courseId,
    isDestroyed: false,
    student: { isDestroyed: false },
  };

  if (query.q.trim()) {
    where.OR = [
      { student: { firstName: { contains: query.q, mode: "insensitive" } } },
      { student: { lastName: { contains: query.q, mode: "insensitive" } } },
      { student: { email: { contains: query.q, mode: "insensitive" } } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.enrollment.findMany({
      where,
      include: { student: { include: { avatar: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: query.itemsPerPage,
    }),
    prisma.enrollment.count({ where }),
  ]);

  const data = rows.map((item) => ({
    id: item.id,
    name: `${item.student.firstName} ${item.student.lastName}`.trim(),
    country: "Unknown",
    joinedDate: item.createdAt,
    progress: Number(item.progress || 0),
  }));

  return {
    data,
    pagination: {
      page: query.page,
      itemsPerPage: query.itemsPerPage,
      total,
      totalPages: Math.ceil(total / query.itemsPerPage),
    },
  };
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
  getStudentsByLecturerIdAndCourseIdV2,
};
