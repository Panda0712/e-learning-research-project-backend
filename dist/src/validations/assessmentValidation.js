import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
const createAssessment = async (req, res, next) => {
    const correctCondition = Joi.object({
        courseId: Joi.number().integer().required().positive(),
        lessonId: Joi.number().integer().required().positive(),
        title: Joi.string().required().min(2).max(50).trim().strict(),
        type: Joi.string().required().min(2).max(50).trim().strict(),
        dueDate: Joi.date().required(),
        status: Joi.string().required().min(2).max(50).trim().strict(),
        totalSubmissions: Joi.number().integer().required().positive(),
        averageScore: Joi.number().integer().required().positive(),
    });
    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const getAssessmentsForLecturer = async (req, res, next) => {
    const correctCondition = Joi.object({
        lecturerId: Joi.number().required(),
    });
    try {
        await correctCondition.validateAsync(req.params, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const getAssessmentById = async (req, res, next) => {
    const correctCondition = Joi.object({
        id: Joi.number().required(),
    });
    try {
        await correctCondition.validateAsync(req.params, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const getSubmissionDetails = async (req, res, next) => {
    const correctCondition = Joi.object({
        assessmentId: Joi.number().required(),
    });
    try {
        await correctCondition.validateAsync(req.params, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const updateAssessment = async (req, res, next) => {
    const correctCondition = Joi.object({
        title: Joi.string().min(2).max(50).trim().strict(),
        status: Joi.string().min(2).max(50).trim().strict(),
        dueDate: Joi.date(),
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
const updateFeedback = async (req, res, next) => {
    const correctCondition = Joi.object({
        submissionId: Joi.number().integer().required().positive(),
        feedback: Joi.string().required().min(2).max(50).trim().strict(),
    });
    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const deleteAssessment = async (req, res, next) => {
    const correctCondition = Joi.object({
        id: Joi.number().required(),
    });
    try {
        await correctCondition.validateAsync(req.params, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
export const assessmentValidation = {
    createAssessment,
    getAssessmentsForLecturer,
    getAssessmentById,
    getSubmissionDetails,
    updateAssessment,
    updateFeedback,
    deleteAssessment,
};
//# sourceMappingURL=assessmentValidation.js.map