import { courseReviewController } from "@/controllers/courseReviewController.js";
import { courseReviewValidation } from "@/validations/courseReviewValidation.js";
import express from "express";

const Router = express.Router();

// Create course review
Router.route("/").post(
  courseReviewValidation.createCourseReview,
  courseReviewController.createCourseReview,
);

// Get all course reviews (admin)
Router.route("/").get(courseReviewController.getAllCourseReviews);

// Get course review by ID
Router.route("/:id").get(
  courseReviewValidation.getCourseReviewById,
  courseReviewController.getCourseReviewById,
);

// Get reviews by course ID
Router.route("/course/:courseId").get(
  courseReviewValidation.getReviewsByCourseId,
  courseReviewController.getReviewsByCourseId,
);

// Get reviews by student ID
Router.route("/student/:studentId").get(
  courseReviewValidation.getReviewsByStudentId,
  courseReviewController.getReviewsByStudentId,
);

// Update course review
Router.route("/:id").put(
  courseReviewValidation.updateCourseReview,
  courseReviewController.updateCourseReview,
);

// Delete course review
Router.route("/:id").delete(
  courseReviewValidation.deleteCourseReview,
  courseReviewController.deleteCourseReview,
);

export const courseReviewRoute = Router;
