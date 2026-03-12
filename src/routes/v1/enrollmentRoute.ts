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

Router.route("/lecturer/:lecturerId/students").get(
  enrollmentValidation.getStudentsByLecturerId, 
  enrollmentController.getStudentsByLecturerId 
);

export const enrollmentRoute = Router;
