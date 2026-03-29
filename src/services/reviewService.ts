import { prisma } from "@/lib/prisma.js";
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from "@/utils/constants.js";
// import { MapReview } from "@/types/review.type.js";

const mapReview = (review: any) => {
  const studentName =
    review.studentName ||
    [review.student?.firstName, review.student?.lastName]
      .filter(Boolean)
      .join(" ") ||
    "Student";

  return {
    id: review.id,
    heading: review.course?.name || "Student Review",
    content: review.content || "",
    studentName,
    studentAvatar:
      review.studentAvatar || review.student?.avatar?.fileUrl || null,
    rating: review.rating || 0,
  };
};

const getHighlightReviews = async (limit: number = 3) => {
  try {
    const reviews = await prisma.courseReview.findMany({
      where: { isDestroyed: false },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        course: { select: { name: true } },
        student: {
          select: {
            firstName: true,
            lastName: true,
            avatar: { select: { fileUrl: true } },
          },
        },
      },
    });

    return reviews.map(mapReview) || [];
  } catch (error: any) {
    throw error;
  }
};

const getReviewsByCourseId = async (courseId: number, limit = 10) => {
  try {
    const reviews = await prisma.courseReview.findMany({
      where: { courseId, isDestroyed: false },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        course: { select: { name: true } },
        student: {
          select: {
            firstName: true,
            lastName: true,
            avatar: { select: { fileUrl: true } },
          },
        },
      },
    });

    return reviews.map(mapReview) || [];
  } catch (error: any) {
    throw error;
  }
};

const getReviewsByCourseIdV2 = async (
  courseId: number,
  page: number = DEFAULT_PAGE,
  itemsPerPage: number = DEFAULT_ITEMS_PER_PAGE,
  limit = 10,
) => {
  const currentPage = Number(page) > 0 ? Number(page) : DEFAULT_PAGE;
  const perPage =
    Number(itemsPerPage) > 0 ? Number(itemsPerPage) : DEFAULT_ITEMS_PER_PAGE;
  const skip = (currentPage - 1) * perPage;

  const where = { courseId, isDestroyed: false };

  try {
    const [rows, total] = await Promise.all([
      prisma.courseReview.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: perPage,
        include: {
          course: { select: { name: true } },
          student: {
            select: {
              firstName: true,
              lastName: true,
              avatar: { select: { fileUrl: true } },
            },
          },
        },
      }),
      prisma.courseReview.count({ where }),
    ]);

    return {
      data: rows.map(mapReview),
      pagination: {
        page: currentPage,
        itemsPerPage: perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  } catch (error: any) {
    throw error;
  }
};

export const reviewService = {
  getHighlightReviews,
  getReviewsByCourseId,
  getReviewsByCourseIdV2,
};
