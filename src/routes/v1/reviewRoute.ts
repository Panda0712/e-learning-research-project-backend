import { reviewController } from "@/controllers/reviewController.js";
import { reviewValidation } from "@/validations/reviewValidation.js";
import express from "express";

const Router = express.Router();

Router.get(
  "/highlights",
  reviewValidation.getHighlightReviews,
  reviewController.getHighlightReviews,
);

Router.get(
  "/by-course/:courseId",
  reviewValidation.getReviewsByCourseId,
  reviewController.getReviewsByCourseId,
);

Router.get(
  "/by-course-v2/:courseId",
  reviewValidation.getReviewsByCourseIdV2,
  reviewController.getReviewsByCourseIdV2,
);

export const reviewRoute = Router;
