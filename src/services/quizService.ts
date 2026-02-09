import { prisma } from "@/lib/prisma.js";
import { CreateQuiz, UpdateQuiz } from "@/types/quiz.type.js";
import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const createQuiz = async (data: CreateQuiz) => {
  try {
    // check lesson existence
    const { lessonId } = data;
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId, isDestroyed: false },
    });
    if (!lesson) throw new ApiError(StatusCodes.NOT_FOUND, "Lesson not found!");

    // check quiz existence
    const quiz = await prisma.quiz.findFirst({
      where: { title: data.title, lessonId: lesson.id, isDestroyed: false },
    });
    if (quiz) throw new ApiError(StatusCodes.CONFLICT, "Quiz already exists!");

    // create quiz
    const createdQuiz = await prisma.quiz.create({
      data: {
        lessonId: lesson.id,
        title: data.title,
        description: data.description,
        timeLimit: data.timeLimit,
        passingScore: data.passingScore,
      },
    });

    return createdQuiz;
  } catch (error: any) {
    throw new Error(error);
  }
};

const updateQuiz = async (id: number, updateData: UpdateQuiz) => {
  try {
    // check quiz existence
    const quiz = await prisma.quiz.findUnique({
      where: { id, isDestroyed: false },
    });
    if (!quiz) throw new ApiError(StatusCodes.NOT_FOUND, "Quiz not found!");

    // check quiz update data
    const { title, description, timeLimit, passingScore } = updateData;
    if (title) quiz.title = title;
    if (description) quiz.description = description;
    if (timeLimit) quiz.timeLimit = timeLimit;
    if (passingScore) quiz.passingScore = passingScore;

    // update quiz
    const updatedQuiz = await prisma.quiz.update({
      where: { id },
      data: quiz,
    });

    return updatedQuiz;
  } catch (error: any) {
    throw new Error(error);
  }
};

const deleteQuiz = async (id: number) => {
  try {
    // check quiz existence
    const quiz = await prisma.quiz.findUnique({
      where: { id, isDestroyed: false },
    });
    if (!quiz) throw new ApiError(StatusCodes.NOT_FOUND, "Quiz not found!");

    // delete quiz
    return await prisma.quiz.update({
      where: { id },
      data: { isDestroyed: true },
    });
  } catch (error: any) {
    throw new Error(error);
  }
};

const getQuizById = async (id: number) => {
  try {
    // check quiz existence
    const quiz = await prisma.quiz.findUnique({
      where: { id, isDestroyed: false },
    });
    if (!quiz) throw new ApiError(StatusCodes.NOT_FOUND, "Quiz not found!");

    return quiz;
  } catch (error: any) {
    throw new Error(error);
  }
};

const getAllQuizzesByLessonId = async (lessonId: number) => {
  try {
    // check lesson existence
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId, isDestroyed: false },
    });
    if (!lesson) throw new ApiError(StatusCodes.NOT_FOUND, "Lesson not found!");

    // get quizzes
    const quizzes = await prisma.quiz.findMany({
      where: { lessonId, isDestroyed: false },
    });

    return quizzes;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const quizService = {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizById,
  getAllQuizzesByLessonId,
};
