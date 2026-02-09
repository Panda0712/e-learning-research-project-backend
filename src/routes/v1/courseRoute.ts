import { courseController } from "@/controllers/courseController.js";
import { courseValidation } from "@/validations/courseValidation.js";
import express from "express";

const Router = express.Router();

// course category
Router.route("/categories")
  .get(courseController.getAllCourseCategories)
  .post(
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
Router.route("/faq").post(
  courseValidation.createCourseFaq,
  courseController.createCourseFaq,
);

// course
Router.route("/")
  .post(courseValidation.createCourse, courseController.createCourse)
  .get(courseValidation.getListCourses, courseController.getListCourses);
Router.route("/:id")
  .put(courseValidation.updateCourse, courseController.updateCourse)
  .delete(courseValidation.deleteCourse, courseController.deleteCourse);
Router.route("/approve-course/:id").put(
  courseValidation.approveCourse,
  courseController.approveCourse,
);
Router.route("/reject-course/:id").put(
  courseValidation.rejectCourse,
  courseController.rejectCourse,
);
Router.route("/get-course-by-id/:id").get(
  courseValidation.getCourseById,
  courseController.getCourseById,
);
Router.route("/get-courses-by-lecturer-id/:lecturerId").get(
  courseValidation.getAllCoursesByLecturerId,
  courseController.getAllCoursesByLecturerId,
);
Router.route("/get-courses-by-category-id/:categoryId").get(
  courseValidation.getAllCoursesByCategoryId,
  courseController.getAllCoursesByCategoryId,
);

export const courseRoute = Router;
