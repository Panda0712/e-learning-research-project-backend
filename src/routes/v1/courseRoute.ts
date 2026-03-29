import { courseController } from "@/controllers/courseController.js";
import { authMiddleware } from "@/middlewares/authMiddleware.js";
import { multerUploadMiddleware } from "@/middlewares/multerUploadMiddleware.js";
import { courseValidation } from "@/validations/courseValidation.js";
import express from "express";

const Router = express.Router();

// course category
Router.route("/categories")
  .get(courseController.getAllCourseCategories)
  .post(
    authMiddleware.isAuthorized,
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
  authMiddleware.isAuthorized,
  courseValidation.createCourseFaq,
  courseController.createCourseFaq,
);

// course
Router.route("/")
  .post(
    authMiddleware.isAuthorized,
    courseValidation.createCourse,
    courseController.createCourse,
  )
  .get(courseValidation.getListCourses, courseController.getListCourses);
Router.route("/:id")
  .put(
    authMiddleware.isAuthorized,
    courseValidation.updateCourse,
    courseController.updateCourse,
  )
  .delete(
    authMiddleware.isAuthorized,
    courseValidation.deleteCourse,
    courseController.deleteCourse,
  );
Router.route("/approve-course/:id").put(
  authMiddleware.isAuthorized,
  courseValidation.approveCourse,
  courseController.approveCourse,
);
Router.route("/reject-course/:id").put(
  authMiddleware.isAuthorized,
  courseValidation.rejectCourse,
  courseController.rejectCourse,
);
Router.route("/get-course-by-id/:id").get(
  courseValidation.getCourseById,
  courseController.getCourseById,
);
Router.route("/list-lecturers-by-student-id/:studentId").get(
  courseValidation.getListLecturersByStudentId,
  courseController.getListLecturersByStudentId,
);
Router.route("/get-courses-by-student-id/:studentId").get(
  courseValidation.getAllCoursesByStudentId,
  courseController.getAllCoursesByStudentId,
);
Router.route("/get-courses-by-lecturer-id/:lecturerId").get(
  courseValidation.getAllCoursesByLecturerId,
  courseController.getAllCoursesByLecturerId,
);
Router.route("/get-courses-by-category-id/:categoryId").get(
  courseValidation.getAllCoursesByCategoryId,
  courseController.getAllCoursesByCategoryId,
);
Router.route("/thumbnail").post(
  authMiddleware.isAuthorized,
  multerUploadMiddleware.uploadImage.single("images"),
  courseController.uploadCourseThumbnail,
);

Router.route("/my-lecturers").get(
  authMiddleware.isAuthorized,
  courseController.getMyLecturers,
);

Router.route("/my-courses").get(
  authMiddleware.isAuthorized,
  courseController.getMyCourses,
);

Router.route("/admin/list").get(
  authMiddleware.isAuthorized,
  courseController.getAdminCourses,
);

Router.route("/admin/:id").get(
  authMiddleware.isAuthorized,
  courseController.getAdminCourseById,
);

export const courseRoute = Router;
