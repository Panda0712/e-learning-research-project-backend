import { authMiddleware } from "@/middlewares/authMiddleware.js";
import { enrollmentValidation } from "@/validations/enrollmentValidation.js";
import express from "express";
import { enrollmentController } from "../../controllers/enrollmentController.js";

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
  enrollmentController.getStudentsByLecturerId,
);

Router.route("/my/progress").put(
  authMiddleware.isAuthorized,
  enrollmentValidation.updateMyEnrollmentProgress,
  enrollmentController.updateMyEnrollmentProgress,
);

Router.route("/my/course/:courseId/progress").get(
  authMiddleware.isAuthorized,
  enrollmentValidation.getMyEnrollmentProgressByCourse,
  enrollmentController.getMyEnrollmentProgressByCourse,
);

export const enrollmentRoute = Router;
