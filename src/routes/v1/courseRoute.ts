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

// course
Router.route("/create-course").post(
  courseValidation.createCourse,
  courseController.createCourse,
);
Router.route("/update-course/:id").put(
  courseValidation.updateCourse,
  courseController.updateCourse,
);
Router.route("/delete-course/:id").delete(
  courseValidation.deleteCourse,
  courseController.deleteCourse,
);
Router.route("/approve-course/:id").put(
  courseValidation.approveCourse,
  courseController.approveCourse,
);
Router.route("/reject-course/:id").put(
  courseValidation.rejectCourse,
  courseController.rejectCourse,
);

export const courseRoute = Router;
