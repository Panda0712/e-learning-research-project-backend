import { quizService } from "@/services/quizService.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const createQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const createdQuiz = await quizService.createQuiz(req.body);

    res.status(StatusCodes.CREATED).json(createdQuiz);
  } catch (error) {
    next(error);
  }
};

const updateQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const updatedQuiz = await quizService.updateQuiz(Number(id), req.body);

    res.status(StatusCodes.OK).json(updatedQuiz);
  } catch (error) {
    next(error);
  }
};

const deleteQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await quizService.deleteQuiz(Number(id));

    res.status(StatusCodes.OK).json({ message: "Quiz deleted successfully!" });
  } catch (error) {
    next(error);
  }
};

const getQuizById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const quiz = await quizService.getQuizById(Number(id));

    res.status(StatusCodes.OK).json(quiz);
  } catch (error) {
    next(error);
  }
};

const getAllQuizzesByLessonId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { lessonId } = req.params;

    const quizzes = await quizService.getAllQuizzesByLessonId(Number(lessonId));

    res.status(StatusCodes.OK).json(quizzes);
  } catch (error) {
    next(error);
  }
};

export const quizController = {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizById,
  getAllQuizzesByLessonId,
};
