import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
const createCourseReview = async (req, res, next) => {
    const correctCondition = Joi.object({
        courseId: Joi.number().required().positive(),
        studentId: Joi.number().required().positive(),
        studentName: Joi.string().optional(),
        studentAvatar: Joi.string().optional(),
        rating: Joi.number().required().min(1).max(5),
        content: Joi.string().optional(),
    });
    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const getCourseReviewById = async (req, res, next) => {
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
const getReviewsByCourseId = async (req, res, next) => {
    const correctCondition = Joi.object({
        courseId: Joi.number().required().positive(),
    });
    try {
        await correctCondition.validateAsync(req.params, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const getReviewsByStudentId = async (req, res, next) => {
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
const updateCourseReview = async (req, res, next) => {
    const paramsCondition = Joi.object({
        id: Joi.number().required().positive(),
    });
    const bodyCondition = Joi.object({
        rating: Joi.number().optional().min(1).max(5),
        content: Joi.string().optional(),
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
const deleteCourseReview = async (req, res, next) => {
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
export const courseReviewValidation = {
    createCourseReview,
    getCourseReviewById,
    getReviewsByCourseId,
    getReviewsByStudentId,
    updateCourseReview,
    deleteCourseReview,
};
//# sourceMappingURL=courseReviewValidation.js.map