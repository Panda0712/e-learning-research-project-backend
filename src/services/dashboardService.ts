import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { ACCOUNT_ROLES } from "@/utils/constants.js";
import {
  calculateDateRange,
  getDateIndex,
  initChartData,
} from "@/utils/helpers.js";
import { StatusCodes } from "http-status-codes";

// ==========================================
// ADMIN FUNCTIONS
// ==========================================
const ensureAccess = async (
  input: {
    userId: number;
    userRole: string;
  },
  permissionRole: string[],
) => {
  const user = await prisma.user.findUnique({
    where: { id: input.userId, isDestroyed: false },
    select: {
      id: true,
      role: true,
      isDestroyed: true,
    },
  });

  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");

  const normalizedRole = String(
    user.role || input.userRole || "",
  ).toLowerCase();

  if (!permissionRole.includes(normalizedRole)) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      `This account is not allowed to access ${permissionRole} dashboard data!`,
    );
  }

  return user;
};

const getAdminStats = async (actor: { userId: number; userRole: string }) => {
  try {
    await ensureAccess(actor, [ACCOUNT_ROLES.ADMIN]);

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
      prisma.user.count({
        where: { role: "lecturer", isVerified: true, isDestroyed: false },
      }),
      prisma.revenue.aggregate({
        where: {
          order: {
            isDestroyed: false,
          },
          course: {
            isDestroyed: false,
          },
        },
        _sum: { platformFee: true },
      }),
      prisma.course.count({ where: { status: "pending", isDestroyed: false } }),
      prisma.enrollment.count({
        where: {
          isDestroyed: false,
          createdAt: { gte: sevenDaysAgo },
          course: { isDestroyed: false },
          student: { isDestroyed: false },
        },
      }),
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
          where: {
            isDestroyed: false,
            lecturer: { isDestroyed: false },
          },
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
    throw error;
  }
};

const getAdminCharts = async (
  actor: { userId: number; userRole: string },
  period: string = "this_year",
  from?: string,
  to?: string,
) => {
  try {
    await ensureAccess(actor, [ACCOUNT_ROLES.ADMIN]);

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
        where: {
          createdAt: { gte: startDate, lte: endDate },
          order: { isDestroyed: false },
          course: { isDestroyed: false },
        },
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
    throw error;
  }
};

// ==========================================
// LECTURER FUNCTIONS
// ==========================================

const getLecturerStats = async ({
  lecturerId,
  userRole,
}: {
  lecturerId: number;
  userRole: string;
}) => {
  try {
    await ensureAccess({ userId: lecturerId, userRole }, [
      ACCOUNT_ROLES.ADMIN,
      ACCOUNT_ROLES.LECTURER,
    ]);

    const lecturer = await prisma.user.findUnique({
      where: { id: lecturerId, isDestroyed: false },
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
      paidOrderItems,
      completedCourses,
      newEnrollments,
      topCourses,
      recentEnrollments,
      recentReviews,
    ] = await Promise.all([
      prisma.enrollment
        .findMany({
          where: {
            isDestroyed: false,
            student: { isDestroyed: false },
            course: {
              lecturerId,
              isDestroyed: false,
            },
          },
          distinct: ["studentId"],
          select: { studentId: true },
        })
        .then((res) => res.length),
      prisma.course.count({
        where: { lecturerId, status: "published", isDestroyed: false },
      }),
      prisma.revenue.aggregate({
        where: {
          lecturerId,
          order: { isDestroyed: false },
          course: { isDestroyed: false },
        },
        _sum: { lecturerEarn: true },
      }),
      prisma.orderItem.findMany({
        where: {
          isDestroyed: false,
          course: {
            lecturerId,
            isDestroyed: false,
          },
          order: {
            isDestroyed: false,
            paymentStatus: "paid",
          },
        },
        select: {
          price: true,
        },
      }),
      prisma.enrollment.count({
        where: {
          isDestroyed: false,
          progress: 100,
          student: { isDestroyed: false },
          course: {
            lecturerId,
            isDestroyed: false,
          },
        },
      }),
      prisma.enrollment.count({
        where: {
          isDestroyed: false,
          createdAt: { gte: sevenDaysAgo },
          student: { isDestroyed: false },
          course: {
            lecturerId,
            isDestroyed: false,
          },
        },
      }),
      prisma.course.findMany({
        where: { lecturerId, isDestroyed: false },
        take: 5,
        orderBy: { totalStudents: "desc" },
        select: { id: true, name: true, totalStudents: true },
      }),
      prisma.enrollment.findMany({
        where: {
          isDestroyed: false,
          student: { isDestroyed: false },
          course: {
            lecturerId,
            isDestroyed: false,
          },
        },
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
        where: {
          isDestroyed: false,
          student: { isDestroyed: false },
          course: {
            lecturerId,
            isDestroyed: false,
          },
        },
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
        totalEarnings:
          totalEarnings._sum.lecturerEarn ||
          paidOrderItems.reduce(
            (sum, item) => sum + Number(item.price || 0) * 0.8,
            0,
          ),
        assignmentsGraded: 0,
        completedCourses,
        newEnrollments,
      },
      recentActivity,
      topCourses,
    };
  } catch (error: any) {
    throw error;
  }
};

const getLecturerCharts = async (
  { lecturerId, userRole }: { lecturerId: number; userRole: string },
  period: string = "this_year",
  from?: string,
  to?: string,
) => {
  try {
    await ensureAccess({ userId: lecturerId, userRole }, [
      ACCOUNT_ROLES.ADMIN,
      ACCOUNT_ROLES.LECTURER,
    ]);

    const lecturer = await prisma.user.findUnique({
      where: { id: lecturerId, isDestroyed: false },
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
          isDestroyed: false,
          student: { isDestroyed: false },
          course: {
            lecturerId,
            isDestroyed: false,
          },
          createdAt: { gte: startDate, lte: endDate },
        },
        select: { createdAt: true },
      }),
      prisma.revenue.findMany({
        where: {
          lecturerId,
          createdAt: { gte: startDate, lte: endDate },
          order: { isDestroyed: false },
          course: { isDestroyed: false },
        },
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
    throw error;
  }
};

export const dashboardService = {
  getAdminStats,
  getAdminCharts,
  getLecturerStats,
  getLecturerCharts,
};
