import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
const createEnrollment = async (req, res, next) => {
    const correctCondition = Joi.object({
        studentId: Joi.number().integer().required().positive(),
        courseId: Joi.number().integer().required().positive(),
    });
    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const getEnrollmentsByStudentId = async (req, res, next) => {
    const correctCondition = Joi.object({
        studentId: Joi.number().integer().required().positive(),
    });
    try {
        await correctCondition.validateAsync(req.params, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const getStudentsByLecturerId = async (req, res, next) => {
    const correctCondition = Joi.object({
        lecturerId: Joi.number().integer().required().positive(),
    });
    try {
        await correctCondition.validateAsync(req.params, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
export const enrollmentValidation = {
    createEnrollment,
    getEnrollmentsByStudentId,
    getStudentsByLecturerId,
};
//# sourceMappingURL=enrollmentValidation.js.map