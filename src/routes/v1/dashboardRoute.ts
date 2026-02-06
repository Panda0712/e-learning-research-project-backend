import { dashboardController } from "@/controllers/dashboardController.js";
import { authMiddleware } from "@/middlewares/authMiddleware.js";
import { dashboardValidation } from "@/validations/dashboardValidation.js";
import express from "express";

const Router = express.Router();

// --- Route Admin ---
Router.get(
  "/admin/overview",
  authMiddleware.isAuthorized,
  dashboardController.getAdminOverview,
);
Router.get(
  "/admin/charts",
  authMiddleware.isAuthorized,
  dashboardValidation.getRevenueChart,
  dashboardController.getAdminCharts,
);

// --- Route Lecturer ---
Router.get(
  "/lecturer/overview",
  authMiddleware.isAuthorized,
  dashboardController.getLecturerOverview,
);
Router.get(
  "/lecturer/charts",
  authMiddleware.isAuthorized,
  dashboardValidation.getRevenueChart,
  dashboardController.getLecturerCharts,
);

export const dashboardRoute = Router;
