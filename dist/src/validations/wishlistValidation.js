import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
const createWishlist = async (req, res, next) => {
    const correctCondition = Joi.object({
        userId: Joi.number().required().positive(),
        courseId: Joi.number().required().positive(),
        courseThumbnail: Joi.string().optional(),
        courseName: Joi.string().optional(),
        lecturer: Joi.string().optional(),
    });
    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const getWishlistById = async (req, res, next) => {
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
const getWishlistsByUserId = async (req, res, next) => {
    const correctCondition = Joi.object({
        userId: Joi.number().required().positive(),
    });
    try {
        await correctCondition.validateAsync(req.params, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const checkCourseInWishlist = async (req, res, next) => {
    const correctCondition = Joi.object({
        userId: Joi.number().required().positive(),
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
const updateWishlist = async (req, res, next) => {
    const paramsCondition = Joi.object({
        id: Joi.number().required().positive(),
    });
    const bodyCondition = Joi.object({
        courseThumbnail: Joi.string().optional(),
        courseName: Joi.string().optional(),
        lecturer: Joi.string().optional(),
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
const deleteWishlist = async (req, res, next) => {
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
const deleteWishlistByCourse = async (req, res, next) => {
    const correctCondition = Joi.object({
        userId: Joi.number().required().positive(),
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
export const wishlistValidation = {
    createWishlist,
    getWishlistById,
    getWishlistsByUserId,
    checkCourseInWishlist,
    updateWishlist,
    deleteWishlist,
    deleteWishlistByCourse,
};
//# sourceMappingURL=wishlistValidation.js.map