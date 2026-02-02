import { assessmentController } from "@/controllers/assessmentController.js";
import { assessmentValidation } from "@/validations/assessmentValidation.js";
import express from "express";

const Router = express.Router();

Router.route("/create-new").post(
  assessmentValidation.createAssessment,
  assessmentController.createAssessment,
);

Router.route("/lecturer-list/:lecturerId").get(
  assessmentValidation.getAssessmentsForLecturer,
  assessmentController.getAssessmentsForLecturer,
);

Router.route("/feedback").put(
  assessmentValidation.updateFeedback,
  assessmentController.updateFeedback,
);

Router.route("/get-submissions-by-assessmentId/:assessmentId").get(
  assessmentValidation.getSubmissionDetails,
  assessmentController.getSubmissionDetails,
);

Router.route("/:id")
  .get(
    assessmentValidation.getAssessmentById,
    assessmentController.getAssessmentById,
  )
  .put(
    assessmentValidation.updateAssessment,
    assessmentController.updateAssessment,
  )
  .delete(
    assessmentValidation.deleteAssessment,
    assessmentController.deleteAssessment,
  );

export const assessmentRoute = Router;
