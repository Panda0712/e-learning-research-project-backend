import { quizService } from "@/services/quizService.js";
import { StatusCodes } from "http-status-codes";
const createQuiz = async (req, res, next) => {
    try {
        const createdQuiz = await quizService.createQuiz(req.body);
        res.status(StatusCodes.CREATED).json(createdQuiz);
    }
    catch (error) {
        next(error);
    }
};
const updateQuiz = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedQuiz = await quizService.updateQuiz(Number(id), req.body);
        res.status(StatusCodes.OK).json(updatedQuiz);
    }
    catch (error) {
        next(error);
    }
};
const deleteQuiz = async (req, res, next) => {
    try {
        const { id } = req.params;
        await quizService.deleteQuiz(Number(id));
        res.status(StatusCodes.OK).json({ message: "Quiz deleted successfully!" });
    }
    catch (error) {
        next(error);
    }
};
const getQuizById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const quiz = await quizService.getQuizById(Number(id));
        res.status(StatusCodes.OK).json(quiz);
    }
    catch (error) {
        next(error);
    }
};
const getAllQuizzesByLessonId = async (req, res, next) => {
    try {
        const { lessonId } = req.params;
        const quizzes = await quizService.getAllQuizzesByLessonId(Number(lessonId));
        res.status(StatusCodes.OK).json(quizzes);
    }
    catch (error) {
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
//# sourceMappingURL=quizController.js.map