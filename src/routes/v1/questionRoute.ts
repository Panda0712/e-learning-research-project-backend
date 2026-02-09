import { questionController } from "@/controllers/questionController.js";
import { questionValidation } from "@/validations/questionValidation.js";
import express from "express";

const Router = express.Router();

Router.route("/").post(
  questionValidation.createQuestion,
  questionController.createQuestion,
);

Router.route("/:id")
  .get(questionValidation.getQuestionById, questionController.getQuestionById)
  .patch(questionValidation.updateQuestion, questionController.updateQuestion)
  .delete(questionValidation.deleteQuestion, questionController.deleteQuestion);

Router.route("/:quizId").get(
  questionValidation.getAllQuestionsByQuizId,
  questionController.getAllQuestionsByQuizId,
);

export const questionRoute = Router;
