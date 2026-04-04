import { prisma } from "@/lib/prisma.js";
import { notificationService } from "@/services/notificationService.js";
import ApiError from "@/utils/ApiError.js";
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from "@/utils/constants.js";
import { StatusCodes } from "http-status-codes";

const createCourseReview = async (data: {
  courseId: number;
  studentId: number;
  studentName?: string;
  studentAvatar?: string;
  rating: number;
  content?: string;
}) => {
  try {
    // Check if student exists
    const student = await prisma.user.findUnique({
      where: { id: data.studentId, isDestroyed: false },
    });

    if (!student) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Student not found!");
    }

    // Check if course exists. Query by id first to avoid false negatives
    // when legacy rows have nullable/dirty isDestroyed values.
    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
      select: { id: true, isDestroyed: true },
    });

    if (!course) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        `Course not found (id=${data.courseId})!`,
      );
    }

    if (course.isDestroyed === true) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Course has been deleted!");
    }

    // Check if student already reviewed this course
    const existingReview = await prisma.courseReview.findFirst({
      where: {
        courseId: data.courseId,
        studentId: data.studentId,
        isDestroyed: false,
      },
    });

    if (existingReview) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "You have already reviewed this course!",
      );
    }

    // Validate rating (1-5)
    if (data.rating < 1 || data.rating > 5) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Rating must be between 1 and 5!",
      );
    }

    const newReview = await prisma.courseReview.create({
      data: {
        courseId: data.courseId,
        studentId: data.studentId,
        studentName:
          data.studentName || `${student.firstName} ${student.lastName}`,
        studentAvatar: data.studentAvatar ?? null,
        rating: data.rating,
        content: data.content ?? null,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
          },
        },
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarId: true,
          },
        },
      },
    });

    if (
      typeof newReview.content === "string" &&
      newReview.content.trim() &&
      Number(newReview.course?.id) > 0
    ) {
      const lecturerId = Number(
        (await prisma.course.findUnique({
          where: { id: data.courseId },
          select: { lecturerId: true, name: true },
        }))?.lecturerId || 0,
      );

      if (lecturerId > 0 && lecturerId !== data.studentId) {
        const commenterName =
          newReview.studentName ||
          [newReview.student?.firstName, newReview.student?.lastName]
            .filter(Boolean)
            .join(" ")
            .trim() ||
          "A student";

        await notificationService.createAndDispatchNotification({
          userId: lecturerId,
          title: "New course comment",
          message: `${commenterName} commented on your course "${newReview.course?.name || "Course"}".`,
          type: "course_comment",
          relatedId: newReview.id,
        });
      }
    }

    return newReview;
  } catch (error) {
    throw error;
  }
};

const getCourseReviewById = async (id: number) => {
  try {
    const review = await prisma.courseReview.findUnique({
      where: { id, isDestroyed: false },
      include: {
        course: {
          select: {
            id: true,
            name: true,
          },
        },
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarId: true,
          },
        },
      },
    });

    if (!review) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Review not found!");
    }

    return review;
  } catch (error) {
    throw error;
  }
};

const getAllCourseReviews = async (params: {
  page?: number;
  limit?: number;
  courseId?: number;
  studentId?: number;
  rating?: number;
}) => {
  try {
    const page = params.page || DEFAULT_PAGE;
    const limit = params.limit || DEFAULT_ITEMS_PER_PAGE;
    const skip = (page - 1) * limit;

    const where: any = { isDestroyed: false };

    if (params.courseId) {
      where.courseId = params.courseId;
    }

    if (params.studentId) {
      where.studentId = params.studentId;
    }

    if (params.rating) {
      where.rating = params.rating;
    }

    const [reviews, total] = await Promise.all([
      prisma.courseReview.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          course: {
            select: {
              id: true,
              name: true,
            },
          },
          student: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatarId: true,
            },
          },
        },
      }),
      prisma.courseReview.count({ where }),
    ]);

    return {
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw error;
  }
};

const getReviewsByCourseId = async (params: {
  courseId: number;
  page?: number;
  limit?: number;
  rating?: number;
}) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
      select: { id: true, isDestroyed: true },
    });

    if (!course || course.isDestroyed === true) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Course not found!");
    }

    const page = params.page || DEFAULT_PAGE;
    const limit = params.limit || DEFAULT_ITEMS_PER_PAGE;
    const skip = (page - 1) * limit;

    const where: any = {
      courseId: params.courseId,
      isDestroyed: false,
    };

    if (params.rating) {
      where.rating = params.rating;
    }

    const [reviews, total, allForStats] = await Promise.all([
      prisma.courseReview.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          course: {
            select: {
              id: true,
              name: true,
            },
          },
          student: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatarId: true,
            },
          },
        },
      }),
      prisma.courseReview.count({ where }),
      prisma.courseReview.findMany({
        where: { courseId: params.courseId, isDestroyed: false },
        select: { rating: true },
      }),
    ]);

    const statisticsData = {
      totalReviews: allForStats.length,
      oneStar: allForStats.filter((r) => r.rating === 1).length,
      twoStar: allForStats.filter((r) => r.rating === 2).length,
      threeStar: allForStats.filter((r) => r.rating === 3).length,
      fourStar: allForStats.filter((r) => r.rating === 4).length,
      fiveStar: allForStats.filter((r) => r.rating === 5).length,
    };

    const averageRating =
      allForStats.length > 0
        ? allForStats.reduce((sum, r) => sum + r.rating, 0) / allForStats.length
        : 0;

    return {
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      statistics: {
        averageRating: Number(averageRating.toFixed(2)),
        ...statisticsData,
      },
    };
  } catch (error) {
    throw error;
  }
};

const getReviewsByStudentId = async (params: {
  studentId: number;
  page?: number;
  limit?: number;
}) => {
  try {
    const page = params.page || DEFAULT_PAGE;
    const limit = params.limit || DEFAULT_ITEMS_PER_PAGE;
    const skip = (page - 1) * limit;

    const where = {
      studentId: params.studentId,
      isDestroyed: false,
    };

    const [reviews, total] = await Promise.all([
      prisma.courseReview.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          course: {
            select: {
              id: true,
              name: true,
            },
          },
          student: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatarId: true,
            },
          },
        },
      }),
      prisma.courseReview.count({ where }),
    ]);

    return {
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw error;
  }
};

const updateCourseReview = async (
  id: number,
  data: {
    rating?: number;
    content?: string;
    lecturerReply?: string | null;
  },
  actorUserId?: number,
) => {
  try {
    const review = await prisma.courseReview.findUnique({
      where: { id, isDestroyed: false },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            lecturerId: true,
          },
        },
        student: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!review) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Review not found!");
    }

    // Validate rating if provided (1-5)
    if (data.rating && (data.rating < 1 || data.rating > 5)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Rating must be between 1 and 5!",
      );
    }

    const updateData: any = {};
    const actor =
      Number.isInteger(actorUserId) && Number(actorUserId) > 0
        ? await prisma.user.findUnique({
            where: { id: Number(actorUserId), isDestroyed: false },
            select: { id: true, role: true },
          })
        : null;

    const actorRole = String(actor?.role || "").toLowerCase();
    const isAdmin = actorRole === "admin";
    const isCourseLecturer =
      Number(actor?.id || 0) > 0 &&
      Number(actor?.id || 0) === Number(review.course?.lecturerId || 0);
    const isReviewOwner =
      Number(actor?.id || 0) > 0 &&
      Number(actor?.id || 0) === Number(review.student?.id || 0);

    const isUpdatingStudentContent =
      data.rating !== undefined || data.content !== undefined;

    if (isUpdatingStudentContent && actor && !isAdmin && !isReviewOwner) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "You are not allowed to update this review!",
      );
    }

    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.content !== undefined) updateData.content = data.content;

    let normalizedLecturerReply: string | null = null;

    if (data.lecturerReply !== undefined) {
      if (actor && !isAdmin && !isCourseLecturer) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          "Only the course lecturer can reply to this review!",
        );
      }

      normalizedLecturerReply =
        typeof data.lecturerReply === "string" ? data.lecturerReply.trim() : "";

      updateData.lecturerReply = normalizedLecturerReply || null;
      updateData.lecturerReplyAt = normalizedLecturerReply ? new Date() : null;
    }

    const updatedReview = await prisma.courseReview.update({
      where: { id },
      data: updateData,
      include: {
        course: {
          select: {
            id: true,
            name: true,
          },
        },
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarId: true,
          },
        },
      },
    });

    if (
      data.lecturerReply !== undefined &&
      typeof normalizedLecturerReply === "string" &&
      normalizedLecturerReply.trim() &&
      Number(updatedReview.studentId) > 0 &&
      Number(updatedReview.studentId) !== Number(actor?.id || 0)
    ) {
      await notificationService.createAndDispatchNotification({
        userId: Number(updatedReview.studentId),
        title: "Lecturer replied to your review",
        message: `Your review on "${updatedReview.course?.name || "Course"}" has a new reply from the lecturer.`,
        type: "course_review_reply",
        relatedId: updatedReview.id,
      });
    }

    return updatedReview;
  } catch (error) {
    throw error;
  }
};

const deleteCourseReview = async (id: number) => {
  try {
    const review = await prisma.courseReview.findUnique({
      where: { id, isDestroyed: false },
    });

    if (!review) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Review not found!");
    }

    await prisma.courseReview.update({
      where: { id },
      data: { isDestroyed: true },
    });

    return { message: "Review deleted successfully!" };
  } catch (error) {
    throw error;
  }
};

export const courseReviewService = {
  createCourseReview,
  getCourseReviewById,
  getAllCourseReviews,
  getReviewsByCourseId,
  getReviewsByStudentId,
  updateCourseReview,
  deleteCourseReview,
};
