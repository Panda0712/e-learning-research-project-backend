import { prisma } from "@/lib/prisma.js";
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

export const reviewService = {
  getHighlightReviews,
  getReviewsByCourseId,
};
