import { prisma } from "@/lib/prisma.js";

// --- Helper 1: Tính toán khoảng thời gian ---
const calculateDateRange = (period: string, customFrom?: string, customTo?: string) => {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();
  let groupBy: "day" | "month" = "day"; // Mặc định nhóm theo ngày

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
      if (customFrom && customTo) {
        startDate = new Date(customFrom);
        endDate = new Date(customTo);
        // Nếu khoảng cách > 60 ngày thì xem theo tháng, ngược lại xem theo ngày
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        groupBy = diffDays > 60 ? "month" : "day";
      }
      break;
      
    case "all_time":
      startDate = new Date(2020, 0, 1); // Mốc quá khứ xa
      endDate = new Date();
      groupBy = "month";
      break;

    default: // Mặc định là This Year
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      groupBy = "month";
  }

  return { startDate, endDate, groupBy };
};

// --- Helper 2: Tạo mảng Labels và Data rỗng ---
const initChartData = (startDate: Date, endDate: Date, groupBy: "day" | "month") => {
  const labels: string[] = [];
  const emptyData: number[] = [];

  if (groupBy === "month") {
    // Tạo 12 tháng: ["Jan", "Feb", ...]
    for (let i = 0; i < 12; i++) {
      const d = new Date(startDate.getFullYear(), i, 1);
      labels.push(d.toLocaleString('en-us', { month: 'short' })); 
      emptyData.push(0);
    }
  } else {
    // Tạo các ngày trong tháng: ["01", "02", ..., "31"]
    const tempDate = new Date(startDate);
    while (tempDate <= endDate) {
      labels.push(
        tempDate.getDate().toString().padStart(2, '0') + 
        "/" + 
        (tempDate.getMonth() + 1).toString().padStart(2, '0')
      ); 
      emptyData.push(0);
      tempDate.setDate(tempDate.getDate() + 1);
    }
  }
  return { labels, emptyData };
};

// Hàm lấy dữ liệu tổng quan (Cards + Charts + Lists)
const getAdminStats = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // 1. Chạy song song các query đếm số liệu (Cards)
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

  // 2. Query danh sách cho phần "Pending Approvals" (Lấy mỗi loại 5 cái mới nhất để gộp)
  const [recentCourses, recentInstructorRequests, recentPayouts] = await Promise.all([
    // A. Khóa học vừa nộp (status = pending)
    prisma.course.findMany({
      where: { status: "pending", isDestroyed: false },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { lecturer: { select: { firstName: true, lastName: true, avatar: true } } }
    }),
    
    // B. Đăng ký làm giảng viên (role = lecturer nhưng chưa verify)
    prisma.user.findMany({
      where: { role: "lecturer", isVerified: false, isDestroyed: false },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, firstName: true, lastName: true, avatar: true, createdAt: true }
    }),

    // C. Yêu cầu rút tiền (Lấy lịch sử gần đây)
    prisma.lecturerPayout.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { lecturer: { select: { firstName: true, lastName: true, avatar: true } } }
    })
  ]);

  // 3. Xử lý logic Merge danh sách "Pending Approvals"
  // Chuẩn hóa dữ liệu về cùng 1 cấu trúc để Frontend dễ hiển thị
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
      status: p.status // success | failed
    }))
  ]
  .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()) // Sắp xếp giảm dần theo thời gian
  .slice(0, 6); // Chỉ lấy 6 tin mới nhất hiển thị ra Dashboard


  // 4. Query danh sách "Top courses by students"
  const topCourses = await prisma.course.findMany({
    take: 5,
    orderBy: { totalStudents: "desc" },
    where: { isDestroyed: false, status: "published" },
    select: { 
      id: true, 
      name: true, 
      totalStudents: true, 
      thumbnail: true 
    }
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
    lists: {
      pendingApprovals: approvalsList,
      topCourses: topCourses
    }
  };
};

// 2. Main Function: Lấy dữ liệu biểu đồ
const getCharts = async (period: string = "this_year", from?: string, to?: string) => {
  // 1. Tính toán ngày bắt đầu, kết thúc và kiểu nhóm (ngày/tháng)
  const { startDate, endDate, groupBy } = calculateDateRange(period, from, to);

  // 2. Query dữ liệu trong khoảng thời gian đó
  const [users, revenues] = await Promise.all([
    // Lấy User đăng ký
    prisma.user.findMany({
      where: { 
        createdAt: { gte: startDate, lte: endDate }, 
        role: "student" 
      },
      select: { createdAt: true }
    }),
    
    // Lấy Doanh thu
    prisma.revenue.findMany({
      where: { 
        createdAt: { gte: startDate, lte: endDate } 
      },
      select: { createdAt: true, platformFee: true }
    })
  ]);

  // 3. Chuẩn bị khung dữ liệu (Labels và Mảng rỗng)
  const { labels, emptyData } = initChartData(startDate, endDate, groupBy);
  
  // Clone ra 2 mảng riêng để cộng dồn
  const signupData = [...emptyData]; 
  const revenueData = [...emptyData];

  // 4. Map dữ liệu vào biểu đồ
  // Hàm tìm index trong mảng labels
  const getIndex = (date: Date) => {
    if (groupBy === "month") return date.getMonth(); 
    
    // Nếu theo ngày: Tính khoảng cách ngày từ startDate
    const diffTime = Math.abs(date.getTime() - startDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
  };

  // Cộng dồn Signups
  users.forEach(u => {
    const idx = getIndex(new Date(u.createdAt));
    if (idx >= 0 && idx < signupData.length) signupData[idx]!++;
  });

  // Cộng dồn Revenue
  revenues.forEach(r => {
    const idx = getIndex(new Date(r.createdAt));
    if (idx >= 0 && idx < revenueData.length) revenueData[idx]! += r.platformFee;
  });

  return {
    period,
    groupBy,
    labels,
    datasets: {
      signups: signupData,
      revenue: revenueData
    }
  };
};

export const dashboardAdminService = { getAdminStats, getCharts };