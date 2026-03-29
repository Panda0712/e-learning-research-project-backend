import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
const createModule = async (req, res, next) => {
    const correctCondition = Joi.object({
        courseId: Joi.number().required().positive(),
        title: Joi.string().required().min(2).max(200).trim().strict(),
        description: Joi.string().required().min(2).max(5000).trim().strict(),
        duration: Joi.string().required().min(2).max(50).trim().strict(),
        totalLessons: Joi.number().required().positive(),
    });
    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const updateModule = async (req, res, next) => {
    const correctCondition = Joi.object({
        title: Joi.string().min(2).max(200).trim().strict(),
        description: Joi.string().min(2).max(5000).trim().strict(),
        duration: Joi.string().min(2).max(50).trim().strict(),
        totalLessons: Joi.number().positive(),
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
const deleteModule = async (req, res, next) => {
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
const getModuleById = async (req, res, next) => {
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
const getAllModulesByCourseId = async (req, res, next) => {
    const correctCondition = Joi.object({
        courseId: Joi.number().required().positive(),
    });
    try {
        await correctCondition.validateAsync({ courseId: Number(req.params.courseId) }, {
            abortEarly: false,
        });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
export const moduleValidation = {
    createModule,
    updateModule,
    deleteModule,
    getModuleById,
    getAllModulesByCourseId,
};
//# sourceMappingURL=moduleValidation.js.map