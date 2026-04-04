import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const ensureStudentCanLearnCourse = async (
  studentId: number,
  courseId: number,
) => {
  const actor = await prisma.user.findUnique({
    where: { id: studentId, isDestroyed: false },
    select: { id: true, role: true },
  });

  if (!actor) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
  }

  const normalizedRole = String(actor.role || "").toLowerCase();
  if (normalizedRole === "admin") {
    return true;
  }

  if (normalizedRole === "lecturer") {
    const ownedCourse = await prisma.course.findUnique({
      where: { id: courseId, isDestroyed: false },
      select: { lecturerId: true },
    });

    if (!ownedCourse) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Course not found!");
    }

    if (ownedCourse.lecturerId === actor.id) {
      return true;
    }
  }

  const purchased = await prisma.orderItem.findFirst({
    where: {
      courseId,
      isDestroyed: false,
      order: {
        studentId,
        isDestroyed: false,
        isSuccess: true,
      },
    },
    select: { id: true },
  });

  const enrolled = await prisma.enrollment.findFirst({
    where: {
      studentId,
      courseId,
      isDestroyed: false,
    },
    select: { id: true },
  });

  if (!purchased && !enrolled) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You are not allowed to access this course content!",
    );
  }

  return true;
};

export const courseRepo = {
  ensureStudentCanLearnCourse,
};
