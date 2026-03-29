import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
const createSubmission = async (req, res, next) => {
    const correctCondition = Joi.object({
        assessmentId: Joi.number().required().positive(),
        quizId: Joi.number().required().positive(),
        studentId: Joi.number().required().positive(),
        score: Joi.number().optional().min(0),
        status: Joi.string().optional(),
        feedback: Joi.string().optional(),
        submittedAt: Joi.date().optional(),
    });
    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const getSubmissionById = async (req, res, next) => {
    const correctCondition = Joi.object({
        id: Joi.number().required().positive(),
    });
    try {
        await correctCondition.validateAsync(req.params, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const getSubmissionsByStudentId = async (req, res, next) => {
    const correctCondition = Joi.object({
        studentId: Joi.number().required().positive(),
    });
    try {
        await correctCondition.validateAsync(req.params, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const updateSubmission = async (req, res, next) => {
    const paramsCondition = Joi.object({
        id: Joi.number().required().positive(),
    });
    const bodyCondition = Joi.object({
        score: Joi.number().optional().min(0),
        status: Joi.string().optional(),
        feedback: Joi.string().optional(),
        submittedAt: Joi.date().optional(),
    });
    try {
        await paramsCondition.validateAsync(req.params, { abortEarly: false });
        await bodyCondition.validateAsync(req.body, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const gradeSubmission = async (req, res, next) => {
    const paramsCondition = Joi.object({
        id: Joi.number().required().positive(),
    });
    const bodyCondition = Joi.object({
        score: Joi.number().required().min(0),
        feedback: Joi.string().optional(),
        status: Joi.string().optional(),
    });
    try {
        await paramsCondition.validateAsync(req.params, { abortEarly: false });
        await bodyCondition.validateAsync(req.body, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const deleteSubmission = async (req, res, next) => {
    const correctCondition = Joi.object({
        id: Joi.number().required().positive(),
    });
    try {
        await correctCondition.validateAsync(req.params, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
export const submissionValidation = {
    createSubmission,
    getSubmissionById,
    getSubmissionsByStudentId,
    updateSubmission,
    gradeSubmission,
    deleteSubmission,
};
//# sourceMappingURL=submissionValidation.js.map