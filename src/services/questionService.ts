import { prisma } from "@/lib/prisma.js";
import { CreateQuestion, UpdateQuestion } from "@/types/question.type.js";
import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const createQuestion = async (data: CreateQuestion) => {
  try {
    // check quiz existence
    const quiz = await prisma.quiz.findUnique({
      where: { id: data.quizId, isDestroyed: false },
    });
    if (!quiz) throw new ApiError(StatusCodes.NOT_FOUND, "Quiz not found!");

    // check question existence
    const question = await prisma.question.findFirst({
      where: { question: data.question, quizId: quiz.id, isDestroyed: false },
    });
    if (question)
      throw new ApiError(StatusCodes.CONFLICT, "Question already exists!");

    // create question
    const createdQuestion = await prisma.question.create({
      data: {
        quizId: quiz.id,
        question: data.question,
        type: data.type,
        options: data.options,
        correctAnswer: data.correctAnswer,
        point: data.point,
      },
    });

    return createdQuestion;
  } catch (error: any) {
    throw new Error(error);
  }
};

const updateQuestion = async (id: number, updateData: UpdateQuestion) => {
  try {
    // check question existence
    const existingQuestion = await prisma.question.findUnique({
      where: { id, isDestroyed: false },
    });
    if (!existingQuestion)
      throw new ApiError(StatusCodes.NOT_FOUND, "Question not found!");

    // update question
    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: updateData,
    });

    return updatedQuestion;
  } catch (error: any) {
    throw new Error(error);
  }
};

const deleteQuestion = async (id: number) => {
  try {
    // check question existence
    const existingQuestion = await prisma.question.findUnique({
      where: { id, isDestroyed: false },
    });
    if (!existingQuestion)
      throw new ApiError(StatusCodes.NOT_FOUND, "Question not found!");

    // delete question
    return await prisma.question.update({
      where: { id },
      data: { isDestroyed: true },
    });
  } catch (error: any) {
    throw new Error(error);
  }
};

const getQuestionById = async (id: number) => {
  try {
    // check question existence
    const existingQuestion = await prisma.question.findUnique({
      where: { id, isDestroyed: false },
    });
    if (!existingQuestion)
      throw new ApiError(StatusCodes.NOT_FOUND, "Question not found!");

    return existingQuestion;
  } catch (error: any) {
    throw new Error(error);
  }
};

const getAllQuestionsByQuizId = async (quizId: number) => {
  try {
    // check quiz existence
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId, isDestroyed: false },
    });
    if (!quiz) throw new ApiError(StatusCodes.NOT_FOUND, "Quiz not found!");

    // get questions
    const questions = await prisma.question.findMany({
      where: { quizId, isDestroyed: false },
    });

    return questions;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const questionService = {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionById,
  getAllQuestionsByQuizId,
};
