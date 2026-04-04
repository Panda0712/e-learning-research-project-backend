import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../lib/prisma.js";

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

const updateEnrollmentProgress = async (
  studentId: number,
  data: {
    courseId: number;
    progress: number;
  },
) => {
  const courseId = Number(data.courseId);
  const requestedProgress = Number(data.progress);

  if (!Number.isInteger(courseId) || courseId <= 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid course id!");
  }

  if (!Number.isFinite(requestedProgress)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid progress value!");
  }

  const clampedProgress = Math.min(100, Math.max(0, requestedProgress));

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      studentId,
      courseId,
      isDestroyed: false,
    },
    select: {
      id: true,
      progress: true,
    },
  });

  if (!enrollment) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Enrollment not found!");
  }

  const normalizedCurrentProgress = Number(enrollment.progress || 0);
  const nextProgress = Math.max(normalizedCurrentProgress, clampedProgress);

  const updated = await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: {
      progress: nextProgress,
      status: nextProgress >= 100 ? "completed" : "enrolled",
      lastAccessedAt: new Date(),
    },
    select: {
      id: true,
      studentId: true,
      courseId: true,
      progress: true,
      status: true,
      lastAccessedAt: true,
    },
  });

  return updated;
};

const getEnrollmentProgressByCourse = async (
  studentId: number,
  courseId: number,
) => {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      studentId,
      courseId,
      isDestroyed: false,
    },
    select: {
      id: true,
      studentId: true,
      courseId: true,
      progress: true,
      status: true,
      lastAccessedAt: true,
    },
  });

  if (!enrollment) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Enrollment not found!");
  }

  return enrollment;
};

export const enrollmentService = {
  createEnrollment,
  getEnrollmentsByStudentId,
  getStudentsByLecturerId,
  getStudentsByLecturerIdAndCourseId,
  getStudentsByLecturerIdAndCourseIdV2,
  updateEnrollmentProgress,
  getEnrollmentProgressByCourse,
};
