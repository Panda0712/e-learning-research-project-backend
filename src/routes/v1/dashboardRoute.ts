import { dashboardController } from "@/controllers/dashboardController.js";
import express from "express";

const Router = express.Router();

// --- Route Admin ---
Router.get("/admin/overview", dashboardController.getOverview);
Router.get("/admin/charts", dashboardController.getCharts);

// --- Route Lecturer ---
Router.get("/lecturer/overview", dashboardController.getLecturerOverview);
Router.get("/lecturer/charts", dashboardController.getLecturerCharts);

export const dashboardRoute = Router;