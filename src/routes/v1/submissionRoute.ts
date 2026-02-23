import { submissionController } from "@/controllers/submissionController.js";
import { submissionValidation } from "@/validations/submissionValidation.js";
import express from "express";

const Router = express.Router();

// Create submission
Router.route("/").post(
  submissionValidation.createSubmission,
  submissionController.createSubmission,
);

// Get all submissions (admin)
Router.route("/").get(submissionController.getAllSubmissions);

// Get submission by ID
Router.route("/:id").get(
  submissionValidation.getSubmissionById,
  submissionController.getSubmissionById,
);

// Get submissions by student ID
Router.route("/student/:studentId").get(
  submissionValidation.getSubmissionsByStudentId,
  submissionController.getSubmissionsByStudentId,
);

// Update submission
Router.route("/:id").put(
  submissionValidation.updateSubmission,
  submissionController.updateSubmission,
);

// Grade submission
Router.route("/:id/grade").put(
  submissionValidation.gradeSubmission,
  submissionController.gradeSubmission,
);

// Delete submission
Router.route("/:id").delete(
  submissionValidation.deleteSubmission,
  submissionController.deleteSubmission,
);

export const submissionRoute = Router;
