import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
const createResource = async (req, res, next) => {
    const correctCondition = Joi.object({
        publicId: Joi.string().required().min(2).max(50).trim().strict(),
        fileSize: Joi.number().optional().positive(),
        fileType: Joi.string().optional().min(2).max(50).trim().strict(),
        fileUrl: Joi.string().required().min(2).max(200).trim().strict(),
    });
    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const getResourceById = async (req, res, next) => {
    const correctCondition = Joi.object({
        id: Joi.number().required().positive(),
    });
    try {
        await correctCondition.validateAsync(Number(req.params), {
            abortEarly: false,
        });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const getResourceByPublicId = async (req, res, next) => {
    const correctCondition = Joi.object({
        publicId: Joi.string().required().min(2).max(50).trim().strict(),
    });
    try {
        await correctCondition.validateAsync(req.params, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const getAllResourcesByFileType = async (req, res, next) => {
    const correctCondition = Joi.object({
        fileType: Joi.string().required().min(2).max(50).trim().strict(),
    });
    try {
        await correctCondition.validateAsync(req.params, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const deleteResource = async (req, res, next) => {
    const correctCondition = Joi.object({
        id: Joi.number().required().positive(),
    });
    try {
        await correctCondition.validateAsync(Number(req.params), {
            abortEarly: false,
        });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const deleteResourceByPublicId = async (req, res, next) => {
    const correctCondition = Joi.object({
        publicId: Joi.string().required().min(2).max(50).trim().strict(),
    });
    try {
        await correctCondition.validateAsync(req.params, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
export const resourceValidation = {
    createResource,
    getResourceById,
    getResourceByPublicId,
    getAllResourcesByFileType,
    deleteResource,
    deleteResourceByPublicId,
};
//# sourceMappingURL=resourceValidation.js.map