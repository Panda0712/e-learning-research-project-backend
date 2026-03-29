import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
const createQuestion = async (data) => {
    try {
        // check quiz existence
        const quiz = await prisma.quiz.findUnique({
            where: { id: data.quizId, isDestroyed: false },
        });
        if (!quiz)
            throw new ApiError(StatusCodes.NOT_FOUND, "Quiz not found!");
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
    }
    catch (error) {
        throw error;
    }
};
const updateQuestion = async (id, updateData) => {
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
    }
    catch (error) {
        throw error;
    }
};
const deleteQuestion = async (id) => {
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
    }
    catch (error) {
        throw error;
    }
};
const getQuestionById = async (id) => {
    try {
        // check question existence
        const existingQuestion = await prisma.question.findUnique({
            where: { id, isDestroyed: false },
        });
        if (!existingQuestion)
            throw new ApiError(StatusCodes.NOT_FOUND, "Question not found!");
        return existingQuestion;
    }
    catch (error) {
        throw error;
    }
};
const getAllQuestionsByQuizId = async (quizId) => {
    try {
        // check quiz existence
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId, isDestroyed: false },
        });
        if (!quiz)
            throw new ApiError(StatusCodes.NOT_FOUND, "Quiz not found!");
        // get questions
        const questions = await prisma.question.findMany({
            where: { quizId, isDestroyed: false },
        });
        return questions;
    }
    catch (error) {
        throw error;
    }
};
export const questionService = {
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionById,
    getAllQuestionsByQuizId,
};
//# sourceMappingURL=questionService.js.map