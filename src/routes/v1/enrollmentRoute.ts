import express from "express";
import { enrollmentController } from "../../controllers/enrollmentController.js";
import { enrollmentValidation } from "@/validations/enrollmentValidation.js";

const Router = express.Router();

Router.route("/get-by-student-id/:studentId").get(
  enrollmentValidation.getEnrollmentsByStudentId,
  enrollmentController.getEnrollmentsByStudentId,
);

Router.route("/create-new").post(
  enrollmentValidation.createEnrollment,
  enrollmentController.createEnrollment,
);

export const enrollmentRoute = Router;
