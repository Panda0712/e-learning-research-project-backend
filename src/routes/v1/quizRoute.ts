import { quizController } from "@/controllers/quizController.js";
import { quizValidation } from "@/validations/quizValidation.js";
import express from "express";

const Router = express.Router();

Router.route("/").post(quizValidation.createQuiz, quizController.createQuiz);

Router.route("/:id")
  .get(quizValidation.getQuizById, quizController.getQuizById)
  .patch(quizValidation.updateQuiz, quizController.updateQuiz)
  .delete(quizValidation.deleteQuiz, quizController.deleteQuiz);

Router.route("/:lessonId").get(
  quizValidation.getAllQuizzesByLessonId,
  quizController.getAllQuizzesByLessonId,
);

export const quizRoute = Router;
