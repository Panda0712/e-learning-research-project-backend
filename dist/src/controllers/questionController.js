import { questionService } from "@/services/questionService.js";
import { StatusCodes } from "http-status-codes";
const createQuestion = async (req, res, next) => {
    try {
        const createdQuestion = await questionService.createQuestion(req.body);
        res.status(StatusCodes.CREATED).json(createdQuestion);
    }
    catch (error) {
        next(error);
    }
};
const updateQuestion = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedQuestion = await questionService.updateQuestion(Number(id), req.body);
        res.status(StatusCodes.OK).json(updatedQuestion);
    }
    catch (error) {
        next(error);
    }
};
const deleteQuestion = async (req, res, next) => {
    try {
        const { id } = req.params;
        await questionService.deleteQuestion(Number(id));
        res
            .status(StatusCodes.OK)
            .json({ message: "Question deleted successfully!" });
    }
    catch (error) {
        next(error);
    }
};
const getQuestionById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const question = await questionService.getQuestionById(Number(id));
        res.status(StatusCodes.OK).json(question);
    }
    catch (error) {
        next(error);
    }
};
const getAllQuestionsByQuizId = async (req, res, next) => {
    try {
        const { quizId } = req.params;
        const questions = await questionService.getAllQuestionsByQuizId(Number(quizId));
        res.status(StatusCodes.OK).json(questions);
    }
    catch (error) {
        next(error);
    }
};
export const questionController = {
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionById,
    getAllQuestionsByQuizId,
};
//# sourceMappingURL=questionController.js.map