import { prisma } from "@/lib/prisma.js";
import { COURSE_STATUS } from "@/utils/constants.js";
import { reviewService } from "./reviewService.js";

const parseDurationToMinutes = (duration?: string | null) => {
  if (!duration) return 0;

  const s = duration.toLowerCase();

  const hoursMatch = s.match(/(\d+)\s*h/);
  const minsMatch = s.match(/(\d+)\s*m/);

  const hours = hoursMatch ? Number(hoursMatch[1]) : 0;
  const mins = minsMatch ? Number(minsMatch[1]) : 0;

  if (hours || mins) return hours * 60 + mins;

  const fallback = Number(s.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(fallback)) return 0;

  return Math.round(fallback * 60);
};

const getHomepageStats = async () => {
  const [mentors, students, durations] = await Promise.all([
    prisma.user.count({
      where: {
        role: "lecturer",
        isVerified: true,
        isDestroyed: false,
      },
    }),
    prisma.user.count({
      where: {
        role: "student",
        isVerified: true,
        isDestroyed: false,
      },
    }),
    prisma.course.findMany({
      where: { isDestroyed: false, status: COURSE_STATUS.PUBLISHED },
      select: { duration: true },
    }),
  ]);

  const totalMinutes = durations.reduce(
    (sum, c) => sum + parseDurationToMinutes(c.duration),
    0,
  );

  return {
    mentors,
    hours: Math.round(totalMinutes / 60),
    students,
  };
};

const getPopularCourses = async (limit: number = 6) => {
  const courses = await prisma.course.findMany({
    where: { isDestroyed: false, status: COURSE_STATUS.PUBLISHED },
    take: limit,
    orderBy: { totalStudents: "desc" },
    include: {
      thumbnail: { select: { fileUrl: true } },
      reviews: { select: { rating: true } },
    },
  });

  return courses.map((course) => {
    const ratingCount = course.reviews.length;
    const avg =
      ratingCount > 0
        ? course.reviews.reduce((s, r) => s + r.rating, 0) / ratingCount
        : 0;

    return {
      id: course.id,
      name: course.name,
      thumbnailUrl: course.thumbnail?.fileUrl || null,
      avgRating: Math.round(avg * 10) / 10,
      ratingCount,
    };
  });
};

const getHomepageData = async (opts?: {
  popularLimit?: number;
  reviewLimit?: number;
}) => {
  const popularLimit = opts?.popularLimit || 6;
  const reviewLimit = opts?.reviewLimit || 3;

  const [stats, popularCourses, feedbacks] = await Promise.all([
    getHomepageStats(),
    getPopularCourses(popularLimit),
    reviewService.getHighlightReviews(reviewLimit),
  ]);

  return { stats, popularCourses, feedbacks };
};

export const homepageService = {
  getHomepageStats,
  getPopularCourses,
  getHomepageData,
};
