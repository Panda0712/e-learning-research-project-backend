import { prisma } from "@/lib/prisma.js";

// --- Helper tính ngày tháng (Dùng chung) ---
const getYearRange = (year = new Date().getFullYear()) => ({
  startOfYear: new Date(year, 0, 1),
  endOfYear: new Date(year, 11, 31),
});

// 1. Lấy số liệu tổng quan (Cards + Top Courses + Recent Activity)
const getLecturerStats = async (lecturerId: number) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Chạy song song các câu lệnh đếm
  const [
    totalStudents,
    coursesActive,
    totalEarnings,
    assignmentsGraded, 
    completedCourses,
    newEnrollments,
    topCourses,
    // Lấy dữ liệu cho Recent Activity
    recentEnrollments, 
    recentReviews 
  ] = await Promise.all([
    // 1. Total Students 
    prisma.enrollment.findMany({
      where: { course: { lecturerId } },
      distinct: ['studentId'], // Tránh đếm trùng 1 người mua 2 khóa
      select: { studentId: true }
    }).then(res => res.length),

    // 2. Courses Active 
    prisma.course.count({ where: { lecturerId, status: "published", isDestroyed: false } }),

    // 3. USD Total Earning 
    prisma.revenue.aggregate({
      where: { lecturerId },
      _sum: { lecturerEarn: true }
    }),

    // 4. Assignments Graded 
    Promise.resolve(0), 

    // 5. Completed Courses 
    prisma.enrollment.count({ where: { course: { lecturerId }, progress: 100 } }),

    // 6. New Enrollments (7 ngày qua)
    prisma.enrollment.count({ where: { course: { lecturerId }, createdAt: { gte: sevenDaysAgo } } }),

    // 7. Top Courses 
    prisma.course.findMany({
      where: { lecturerId, isDestroyed: false },
      take: 5,
      orderBy: { totalStudents: "desc" },
      select: { id: true, name: true, totalStudents: true }
    }),

    // 8. Data cho "Recent Activity" - A: Đăng ký mới (Enrollment)
    prisma.enrollment.findMany({
      where: { course: { lecturerId } },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { 
        student: { select: { firstName: true, lastName: true, avatar: true } },
        course: { select: { name: true } }
      }
    }),

    // 9. Data cho "Recent Activity" - B: Đánh giá mới (Review)
prisma.courseReview.findMany({
      where: { 
        course: { lecturerId },
        isDestroyed: false 
      },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        student: { select: { firstName: true, lastName: true, avatar: true } }, 
        course: { select: { name: true } }
      }
    })
  ]);

  // Xử lý GỘP danh sách "Recent Activity" 
  const recentActivity = [
    ...recentEnrollments.map(e => ({
      type: "purchase",
      avatar: e.student.avatar,
      title: `${e.student.firstName} purchased your course "${e.course.name}"`,
      time: e.createdAt,
    })),
    ...recentReviews.map(r => ({
      type: "review",
      avatar: r.student.avatar || r.studentAvatar, 
      title: `${r.student.firstName || r.studentName} gave a ${r.rating} star rating on "${r.course.name}"`,
      time: r.createdAt,
    }))
  ]
  .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5); 

  return {
    cards: {
      totalStudents,
      coursesActive,
      totalEarnings: totalEarnings._sum.lecturerEarn || 0,
      assignmentsGraded,
      completedCourses,
      newEnrollments
    },
    recentActivity,
    topCourses
  };
};

// 2. Lấy dữ liệu biểu đồ (Engagement & Revenue)
const getLecturerCharts = async (lecturerId: number, period: string = "this_year") => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear(), 11, 31);
  
  // Chart 1: Student Engagement 
  const enrollments = await prisma.enrollment.findMany({
    where: { 
      course: { lecturerId },
      createdAt: { gte: startOfYear, lte: endOfYear }
    },
    select: { createdAt: true }
  });

  // Chart 2: Revenue 
  const revenues = await prisma.revenue.findMany({
    where: { 
      lecturerId, 
      createdAt: { gte: startOfYear, lte: endOfYear }
    },
    select: { createdAt: true, lecturerEarn: true }
  });

  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const engagementData = new Array(12).fill(0);
  const revenueData = new Array(12).fill(0);

  enrollments.forEach(e => {
    const month = new Date(e.createdAt).getMonth();
    engagementData[month]!++;
  });

  revenues.forEach(r => {
    const month = new Date(r.createdAt).getMonth();
    revenueData[month]! += r.lecturerEarn;
  });

  return {
    labels,
    datasets: {
      engagement: engagementData,
      revenue: revenueData
    }
  };
};

export const dashboardLecturerService = { getLecturerStats, getLecturerCharts };
