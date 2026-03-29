import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
const createLesson = async (req, res, next) => {
    const correctCondition = Joi.object({
        resource: Joi.object({
            publicId: Joi.string().required(),
            fileUrl: Joi.string().required(),
            fileSize: Joi.number().optional(),
            fileType: Joi.string().optional(),
        }).optional(),
        moduleId: Joi.number().required().positive(),
        title: Joi.string().required().min(2).max(200).trim().strict(),
        description: Joi.string().required().min(2).max(5000).trim().strict(),
        note: Joi.string().min(2).max(5000).trim().strict(),
        video: Joi.object({
            publicId: Joi.string().required(),
            fileUrl: Joi.string().required(),
            fileSize: Joi.number().optional(),
            fileType: Joi.string().optional(),
        }),
        duration: Joi.string().required().min(2).max(50).trim().strict(),
    });
    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const updateLesson = async (req, res, next) => {
    const correctCondition = Joi.object({
        title: Joi.string().min(2).max(200).trim().strict(),
        description: Joi.string().min(2).max(5000).trim().strict(),
        note: Joi.string().min(2).max(5000).trim().strict(),
        resource: Joi.object({
            publicId: Joi.string().required(),
            fileUrl: Joi.string().required(),
            fileSize: Joi.number().optional(),
            fileType: Joi.string().optional(),
        }).optional(),
        video: Joi.object({
            publicId: Joi.string().required(),
            fileUrl: Joi.string().required(),
            fileSize: Joi.number().optional(),
            fileType: Joi.string().optional(),
        }).optional(),
        duration: Joi.string().min(2).max(50).trim().strict(),
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
const deleteLesson = async (req, res, next) => {
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
const getLessonById = async (req, res, next) => {
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
const getAllLessonsByModuleId = async (req, res, next) => {
    const correctCondition = Joi.object({
        moduleId: Joi.number().required().positive(),
    });
    try {
        await correctCondition.validateAsync({ moduleId: Number(req.params.moduleId) }, {
            abortEarly: false,
        });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const getLessonByResourceId = async (req, res, next) => {
    const correctCondition = Joi.object({
        resourceId: Joi.number().required().positive(),
    });
    try {
        await correctCondition.validateAsync({ resourceId: Number(req.params.resourceId) }, {
            abortEarly: false,
        });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
export const lessonValidation = {
    createLesson,
    updateLesson,
    deleteLesson,
    getLessonById,
    getAllLessonsByModuleId,
    getLessonByResourceId,
};
//# sourceMappingURL=lessonValidation.js.map