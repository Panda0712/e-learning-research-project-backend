import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import {
  calculateDateRange,
  getDateIndex,
  initChartData,
} from "@/utils/helpers.js";
import { StatusCodes } from "http-status-codes";

// ==========================================
// ADMIN FUNCTIONS
// ==========================================

const getAdminStats = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalStudents,
      totalInstructors,
      revenueData,
      countPendingCourses,
      newEnrollments,
      totalTransactions,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "student", isDestroyed: false } }),
      prisma.user.count({ where: { role: "lecturer", isVerified: true } }),
      prisma.revenue.aggregate({ _sum: { platformFee: true } }),
      prisma.course.count({ where: { status: "pending", isDestroyed: false } }),
      prisma.enrollment.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.transaction.count({ where: { isDestroyed: false } }),
    ]);

    const [recentCourses, recentInstructorRequests, recentPayouts] =
      await Promise.all([
        prisma.course.findMany({
          where: { status: "pending", isDestroyed: false },
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            lecturer: {
              select: { firstName: true, lastName: true, avatar: true },
            },
          },
        }),
        prisma.user.findMany({
          where: { role: "lecturer", isVerified: false, isDestroyed: false },
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            createdAt: true,
          },
        }),
        prisma.lecturerPayout.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            lecturer: {
              select: { firstName: true, lastName: true, avatar: true },
            },
          },
        }),
      ]);

    const approvalsList = [
      ...recentCourses.map((c) => ({
        type: "course_submission",
        avatar: c.lecturer.avatar,
        title: `${c.lecturer.firstName} ${c.lecturer.lastName} submitted a new course: "${c.name}"`,
        time: c.createdAt,
        status: "Just now",
      })),
      ...recentInstructorRequests.map((u) => ({
        type: "instructor_request",
        avatar: u.avatar,
        title: `${u.firstName} ${u.lastName} has applied to become an Instructor.`,
        time: u.createdAt,
        status: "Wait for verify",
      })),
      ...recentPayouts.map((p) => ({
        type: "payout_request",
        avatar: p.lecturer.avatar,
        title: `${p.lecturer.firstName} requested a withdrawal of $${p.amount}.`,
        time: p.createdAt,
        status: p.status,
      })),
    ]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 6);

    const topCourses = await prisma.course.findMany({
      take: 5,
      orderBy: { totalStudents: "desc" },
      where: { isDestroyed: false, status: "published" },
      select: { id: true, name: true, totalStudents: true, thumbnail: true },
    });

    return {
      cards: {
        totalStudents,
        totalInstructors,
        totalRevenue: revenueData._sum.platformFee || 0,
        pendingCourses: countPendingCourses,
        newEnrollments,
        totalTransactions,
      },
      lists: { pendingApprovals: approvalsList, topCourses },
    };
  } catch (error: any) {
    throw new Error(error);
  }
};

const getAdminCharts = async (
  period: string = "this_year",
  from?: string,
  to?: string,
) => {
  try {
    const { startDate, endDate, groupBy } = calculateDateRange(
      period,
      from,
      to,
    );

    const [users, revenues] = await Promise.all([
      prisma.user.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          role: "student",
          isDestroyed: false,
        },
        select: { createdAt: true },
      }),
      prisma.revenue.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        select: { createdAt: true, platformFee: true },
      }),
    ]);

    const { labels, emptyData } = initChartData(startDate, endDate, groupBy);
    const signupData = [...emptyData];
    const revenueData = [...emptyData];

    users.forEach((u) => {
      const idx = getDateIndex(new Date(u.createdAt), startDate, groupBy);
      if (idx >= 0 && idx < signupData.length) signupData[idx]!++;
    });

    revenues.forEach((r) => {
      const idx = getDateIndex(new Date(r.createdAt), startDate, groupBy);
      if (idx >= 0 && idx < revenueData.length)
        revenueData[idx]! += r.platformFee;
    });

    return {
      period,
      groupBy,
      labels,
      datasets: { signups: signupData, revenue: revenueData },
    };
  } catch (error: any) {
    throw new Error(error);
  }
};

// ==========================================
// LECTURER FUNCTIONS
// ==========================================

const getLecturerStats = async (lecturerId: number) => {
  try {
    const lecturer = await prisma.user.findUnique({
      where: { id: lecturerId },
    });
    if (!lecturer) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Lecturer does not exist!");
    }

    if (lecturer.role !== "lecturer" && lecturer.role !== "admin") {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "This account is not a lecturer!",
      );
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalStudents,
      coursesActive,
      totalEarnings,
      completedCourses,
      newEnrollments,
      topCourses,
      recentEnrollments,
      recentReviews,
    ] = await Promise.all([
      prisma.enrollment
        .findMany({
          where: { course: { lecturerId } },
          distinct: ["studentId"],
          select: { studentId: true },
        })
        .then((res) => res.length),
      prisma.course.count({
        where: { lecturerId, status: "published", isDestroyed: false },
      }),
      prisma.revenue.aggregate({
        where: { lecturerId },
        _sum: { lecturerEarn: true },
      }),
      prisma.enrollment.count({
        where: { course: { lecturerId }, progress: 100 },
      }),
      prisma.enrollment.count({
        where: { course: { lecturerId }, createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.course.findMany({
        where: { lecturerId, isDestroyed: false },
        take: 5,
        orderBy: { totalStudents: "desc" },
        select: { id: true, name: true, totalStudents: true },
      }),
      prisma.enrollment.findMany({
        where: { course: { lecturerId } },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          student: {
            select: { firstName: true, lastName: true, avatar: true },
          },
          course: { select: { name: true } },
        },
      }),
      prisma.courseReview.findMany({
        where: { course: { lecturerId }, isDestroyed: false },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          student: {
            select: { firstName: true, lastName: true, avatar: true },
          },
          course: { select: { name: true } },
        },
      }),
    ]);

    const recentActivity = [
      ...recentEnrollments.map((e) => ({
        type: "purchase",
        avatar: e.student.avatar,
        title: `${e.student.firstName} purchased your course "${e.course.name}"`,
        time: e.createdAt,
      })),
      ...recentReviews.map((r) => ({
        type: "review",
        avatar: r.student.avatar || r.studentAvatar,
        title: `${r.student.firstName || r.studentName} gave a ${r.rating} star rating on "${r.course.name}"`,
        time: r.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5);

    return {
      cards: {
        totalStudents,
        coursesActive,
        totalEarnings: totalEarnings._sum.lecturerEarn || 0,
        assignmentsGraded: 0,
        completedCourses,
        newEnrollments,
      },
      recentActivity,
      topCourses,
    };
  } catch (error: any) {
    throw new Error(error);
  }
};

const getLecturerCharts = async (
  lecturerId: number,
  period: string = "this_year",
  from?: string,
  to?: string,
) => {
  try {
    const lecturer = await prisma.user.findUnique({
      where: { id: lecturerId },
    });
    if (!lecturer)
      throw new ApiError(StatusCodes.NOT_FOUND, "Lecturer does not exist!");

    const { startDate, endDate, groupBy } = calculateDateRange(
      period,
      from,
      to,
    );

    const [enrollments, revenues] = await Promise.all([
      prisma.enrollment.findMany({
        where: {
          course: { lecturerId },
          createdAt: { gte: startDate, lte: endDate },
        },
        select: { createdAt: true },
      }),
      prisma.revenue.findMany({
        where: { lecturerId, createdAt: { gte: startDate, lte: endDate } },
        select: { createdAt: true, lecturerEarn: true },
      }),
    ]);

    const { labels, emptyData } = initChartData(startDate, endDate, groupBy);

    const engagementData = [...emptyData];
    const revenueData = [...emptyData];

    enrollments.forEach((e) => {
      const idx = getDateIndex(new Date(e.createdAt), startDate, groupBy);
      if (idx >= 0 && idx < engagementData.length) engagementData[idx]!++;
    });

    revenues.forEach((r) => {
      const idx = getDateIndex(new Date(r.createdAt), startDate, groupBy);
      if (idx >= 0 && idx < revenueData.length)
        revenueData[idx]! += r.lecturerEarn;
    });

    return {
      period,
      groupBy,
      labels,
      datasets: { engagement: engagementData, revenue: revenueData },
    };
  } catch (error: any) {
    throw new Error(error);
  }
};

export const dashboardService = {
  getAdminStats,
  getAdminCharts,
  getLecturerStats,
  getLecturerCharts,
};
