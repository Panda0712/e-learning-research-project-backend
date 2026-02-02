import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes"; 

// ==========================================
// 1. HELPERS
// ==========================================

const calculateDateRange = (period: string, customFrom?: string, customTo?: string) => {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();
  let groupBy: "day" | "month" = "day";

  switch (period) {
    case "this_month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1); 
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      groupBy = "day";
      break;
    case "last_month":
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); 
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      groupBy = "day";
      break;
    case "this_year":
      startDate = new Date(now.getFullYear(), 0, 1); 
      endDate = new Date(now.getFullYear(), 11, 31); 
      groupBy = "month"; 
      break;
    case "custom":
      if (!customFrom || !customTo) {
         throw new ApiError(StatusCodes.BAD_REQUEST, "Vui lòng chọn ngày bắt đầu và kết thúc!");
      }
      startDate = new Date(customFrom);
      endDate = new Date(customTo);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      groupBy = diffDays > 60 ? "month" : "day";
      break;
    case "all_time":
      startDate = new Date(2020, 0, 1);
      endDate = new Date();
      groupBy = "month";
      break;
    default: 
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      groupBy = "month";
  }
  return { startDate, endDate, groupBy };
};

const initChartData = (startDate: Date, endDate: Date, groupBy: "day" | "month") => {
  const labels: string[] = [];
  const emptyData: number[] = [];

  if (groupBy === "month") {
    for (let i = 0; i < 12; i++) {
      const d = new Date(startDate.getFullYear(), i, 1);
      labels.push(d.toLocaleString('en-us', { month: 'short' })); 
      emptyData.push(0);
    }
  } else {
    const tempDate = new Date(startDate);
    while (tempDate <= endDate) {
      labels.push(
        tempDate.getDate().toString().padStart(2, '0') + "/" + (tempDate.getMonth() + 1).toString().padStart(2, '0')
      ); 
      emptyData.push(0);
      tempDate.setDate(tempDate.getDate() + 1);
    }
  }
  return { labels, emptyData };
};

const getIndex = (date: Date, startDate: Date, groupBy: string) => {
    if (groupBy === "month") return date.getMonth(); 
    const diffTime = Math.abs(date.getTime() - startDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
};

// ==========================================
// 2. ADMIN FUNCTIONS
// ==========================================

const getAdminStats = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [totalStudents, totalInstructors, revenueData, countPendingCourses, newEnrollments, totalTransactions] = await Promise.all([
    prisma.user.count({ where: { role: "student", isDestroyed: false } }),
    prisma.user.count({ where: { role: "lecturer", isVerified: true } }),
    prisma.revenue.aggregate({ _sum: { platformFee: true } }),
    prisma.course.count({ where: { status: "pending", isDestroyed: false } }),
    prisma.enrollment.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.transaction.count({ where: { isDestroyed: false } }),
  ]);

  const [recentCourses, recentInstructorRequests, recentPayouts] = await Promise.all([
    prisma.course.findMany({
      where: { status: "pending", isDestroyed: false },
      take: 5, orderBy: { createdAt: "desc" },
      include: { lecturer: { select: { firstName: true, lastName: true, avatar: true } } }
    }),
    prisma.user.findMany({
      where: { role: "lecturer", isVerified: false, isDestroyed: false },
      take: 5, orderBy: { createdAt: "desc" },
      select: { id: true, firstName: true, lastName: true, avatar: true, createdAt: true }
    }),
    prisma.lecturerPayout.findMany({
      take: 5, orderBy: { createdAt: "desc" },
      include: { lecturer: { select: { firstName: true, lastName: true, avatar: true } } }
    })
  ]);

  const approvalsList = [
    ...recentCourses.map(c => ({
      type: "course_submission",
      avatar: c.lecturer.avatar,
      title: `${c.lecturer.firstName} ${c.lecturer.lastName} submitted a new course: "${c.name}"`,
      time: c.createdAt,
      status: "Just now" 
    })),
    ...recentInstructorRequests.map(u => ({
      type: "instructor_request",
      avatar: u.avatar,
      title: `${u.firstName} ${u.lastName} has applied to become an Instructor.`,
      time: u.createdAt,
      status: "Wait for verify"
    })),
    ...recentPayouts.map(p => ({
      type: "payout_request",
      avatar: p.lecturer.avatar,
      title: `${p.lecturer.firstName} requested a withdrawal of $${p.amount}.`,
      time: p.createdAt,
      status: p.status
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 6);

  const topCourses = await prisma.course.findMany({
    take: 5, orderBy: { totalStudents: "desc" },
    where: { isDestroyed: false, status: "published" },
    select: { id: true, name: true, totalStudents: true, thumbnail: true }
  });

  return {
    cards: {
      totalStudents, totalInstructors,
      totalRevenue: revenueData._sum.platformFee || 0,
      pendingCourses: countPendingCourses, newEnrollments, totalTransactions,
    },
    lists: { pendingApprovals: approvalsList, topCourses }
  };
};

const getAdminCharts = async (period: string = "this_year", from?: string, to?: string) => {
  const { startDate, endDate, groupBy } = calculateDateRange(period, from, to);

  const [users, revenues] = await Promise.all([
    prisma.user.findMany({
      where: { createdAt: { gte: startDate, lte: endDate }, role: "student" },
      select: { createdAt: true }
    }),
    prisma.revenue.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      select: { createdAt: true, platformFee: true }
    })
  ]);

  const { labels, emptyData } = initChartData(startDate, endDate, groupBy);
  const signupData = [...emptyData]; 
  const revenueData = [...emptyData];

  users.forEach(u => {
    const idx = getIndex(new Date(u.createdAt), startDate, groupBy);
    if (idx >= 0 && idx < signupData.length) signupData[idx]!++;
  });

  revenues.forEach(r => {
    const idx = getIndex(new Date(r.createdAt), startDate, groupBy);
    if (idx >= 0 && idx < revenueData.length) revenueData[idx]! += r.platformFee;
  });

  return { period, groupBy, labels, datasets: { signups: signupData, revenue: revenueData } };
};

// ==========================================
// 3. LECTURER FUNCTIONS
// ==========================================

const getLecturerStats = async (lecturerId: number) => {
  const lecturer = await prisma.user.findUnique({ where: { id: lecturerId } });
  if (!lecturer) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Giảng viên không tồn tại!");
  }

  if (lecturer.role !== 'lecturer' && lecturer.role !== 'admin') {
     throw new ApiError(StatusCodes.FORBIDDEN, "Tài khoản này không phải giảng viên!");
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [totalStudents, coursesActive, totalEarnings, completedCourses, newEnrollments, topCourses, recentEnrollments, recentReviews] = await Promise.all([
    prisma.enrollment.findMany({ where: { course: { lecturerId } }, distinct: ['studentId'], select: { studentId: true } }).then(res => res.length),
    prisma.course.count({ where: { lecturerId, status: "published", isDestroyed: false } }),
    prisma.revenue.aggregate({ where: { lecturerId }, _sum: { lecturerEarn: true } }),
    prisma.enrollment.count({ where: { course: { lecturerId }, progress: 100 } }),
    prisma.enrollment.count({ where: { course: { lecturerId }, createdAt: { gte: sevenDaysAgo } } }),
    prisma.course.findMany({ where: { lecturerId, isDestroyed: false }, take: 5, orderBy: { totalStudents: "desc" }, select: { id: true, name: true, totalStudents: true } }),
    prisma.enrollment.findMany({ where: { course: { lecturerId } }, take: 5, orderBy: { createdAt: "desc" }, include: { student: { select: { firstName: true, lastName: true, avatar: true } }, course: { select: { name: true } } } }),
    prisma.courseReview.findMany({ where: { course: { lecturerId }, isDestroyed: false }, take: 5, orderBy: { createdAt: "desc" }, include: { student: { select: { firstName: true, lastName: true, avatar: true } }, course: { select: { name: true } } } })
  ]);

  const recentActivity = [
    ...recentEnrollments.map(e => ({ type: "purchase", avatar: e.student.avatar, title: `${e.student.firstName} purchased your course "${e.course.name}"`, time: e.createdAt })),
    ...recentReviews.map(r => ({ type: "review", avatar: r.student.avatar || r.studentAvatar, title: `${r.student.firstName || r.studentName} gave a ${r.rating} star rating on "${r.course.name}"`, time: r.createdAt }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  return {
    cards: { totalStudents, coursesActive, totalEarnings: totalEarnings._sum.lecturerEarn || 0, assignmentsGraded: 0, completedCourses, newEnrollments },
    recentActivity, topCourses
  };
};

const getLecturerCharts = async (lecturerId: number, period: string = "this_year", from?: string, to?: string) => {
  // 👇 THÊM: Kiểm tra tồn tại
  const lecturer = await prisma.user.findUnique({ where: { id: lecturerId } });
  if (!lecturer) throw new ApiError(StatusCodes.NOT_FOUND, "Giảng viên không tồn tại!");

  const { startDate, endDate, groupBy } = calculateDateRange(period, from, to);

  const [enrollments, revenues] = await Promise.all([
    prisma.enrollment.findMany({
      where: { course: { lecturerId }, createdAt: { gte: startDate, lte: endDate } },
      select: { createdAt: true }
    }),
    prisma.revenue.findMany({
      where: { lecturerId, createdAt: { gte: startDate, lte: endDate } },
      select: { createdAt: true, lecturerEarn: true }
    })
  ]);

  const { labels, emptyData } = initChartData(startDate, endDate, groupBy);
  
  const engagementData = [...emptyData];
  const revenueData = [...emptyData];

  enrollments.forEach(e => {
    const idx = getIndex(new Date(e.createdAt), startDate, groupBy);
    if (idx >= 0 && idx < engagementData.length) engagementData[idx]!++;
  });

  revenues.forEach(r => {
    const idx = getIndex(new Date(r.createdAt), startDate, groupBy);
    if (idx >= 0 && idx < revenueData.length) revenueData[idx]! += r.lecturerEarn;
  });

  return { period, groupBy, labels, datasets: { engagement: engagementData, revenue: revenueData } };
};

export const dashboardService = {
  getAdminStats,
  getAdminCharts,
  getLecturerStats,
  getLecturerCharts
};