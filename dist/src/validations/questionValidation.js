import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
const createQuestion = async (req, res, next) => {
    const correctCondition = Joi.object({
        quizId: Joi.number().required().positive(),
        question: Joi.string().required().min(2).max(200).trim().strict(),
        type: Joi.string().required().min(2).max(50).trim().strict(),
        options: Joi.array()
            .required()
            .items(Joi.string().min(2).max(200).trim().strict()),
        correctAnswer: Joi.string().required().min(2).max(5000).trim().strict(),
        point: Joi.number().required().positive(),
    });
    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const updateQuestion = async (req, res, next) => {
    const correctCondition = Joi.object({
        question: Joi.string().min(2).max(200).trim().strict(),
        type: Joi.string().min(2).max(50).trim().strict(),
        options: Joi.array().items(Joi.string().min(2).max(200).trim().strict()),
        correctAnswer: Joi.string().min(2).max(200).trim().strict(),
        point: Joi.number().positive(),
    });
    try {
        await correctCondition.validateAsync(req.body, {
            abortEarly: false,
            allowUnknown: true,
        });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const deleteQuestion = async (req, res, next) => {
    const correctCondition = Joi.object({
        id: Joi.number().required().positive(),
    });
    try {
        await correctCondition.validateAsync({ id: Number(req.params.id) }, {
            abortEarly: false,
        });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const getQuestionById = async (req, res, next) => {
    const correctCondition = Joi.object({
        id: Joi.number().required().positive(),
    });
    try {
        await correctCondition.validateAsync({ id: Number(req.params.id) }, {
            abortEarly: false,
        });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const getAllQuestionsByQuizId = async (req, res, next) => {
    const correctCondition = Joi.object({
        quizId: Joi.number().required().positive(),
    });
    try {
        await correctCondition.validateAsync({ quizId: Number(req.params.quizId) }, {
            abortEarly: false,
        });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
export const questionValidation = {
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionById,
    getAllQuestionsByQuizId,
};
//# sourceMappingURL=questionValidation.js.map