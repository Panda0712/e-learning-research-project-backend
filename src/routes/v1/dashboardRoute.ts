import { dashboardController } from "@/controllers/dashboardController.js";
import { verifyToken } from "@/middlewares/authMiddleware.js";
import express from "express";

const Router = express.Router();

// --- Route Admin ---
Router.get("/admin/overview", verifyToken, dashboardController.getOverview);
Router.get("/admin/charts", verifyToken, dashboardController.getCharts);

// --- Route Lecturer ---
Router.get("/lecturer/overview", verifyToken, dashboardController.getLecturerOverview);
Router.get("/lecturer/charts", verifyToken, dashboardController.getLecturerCharts);

export const dashboardRoute = Router;