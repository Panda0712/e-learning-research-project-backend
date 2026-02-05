import Joi from "joi";

// 1. Validate cho API thống kê tổng quan
const getGeneralStats = Joi.object({
  startDate: Joi.date().iso().optional().messages({
    "date.base": "Ngày bắt đầu không hợp lệ (Format: YYYY-MM-DD)",
    "date.format": "Ngày bắt đầu phải theo định dạng ISO (YYYY-MM-DD)",
  }),
  endDate: Joi.date().iso().min(Joi.ref("startDate")).optional().messages({
    "date.base": "Ngày kết thúc không hợp lệ",
    "date.min": "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu",
  }),
});

// 2. Validate cho biểu đồ doanh thu
const getRevenueChart = Joi.object({
  period: Joi.string().valid("week", "month", "year").required(),
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional(),
});

// 3. Validate cho Top khóa học bán chạy / Giảng viên tiêu biểu
const getTopRanking = Joi.object({
  limit: Joi.number().integer().min(1).max(20).default(5).optional(),
  sortBy: Joi.string()
    .valid("revenue", "enrollments", "rating")
    .default("revenue")
    .optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().min(Joi.ref("startDate")).optional(),
});

export const dashboardValidation = {
  getGeneralStats,
  getRevenueChart,
  getTopRanking,
};