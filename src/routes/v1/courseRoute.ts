import { courseController } from "@/controllers/courseController.js";
import { courseValidation } from "@/validations/courseValidation.js";
import express from "express";

const Router = express.Router();

// course category
Router.route("/get-categories").get(courseController.getAllCourseCategories);
Router.route("/create-category").post(
  courseValidation.createCourseCategory,
  courseController.createCourseCategory,
);

// course faq
Router.route("/faq/get-by-course-id/:courseId").get(
  courseValidation.getCourseFaqByCourseId,
  courseController.getCourseFaqByCourseId,
);
Router.route("/faq/:id").get(
  courseValidation.getCourseFaqById,
  courseController.getCourseFaqById,
);
Router.route("/create-faq").post(
  courseValidation.createCourseFaq,
  courseController.createCourseFaq,
);

export const courseRoute = Router;
