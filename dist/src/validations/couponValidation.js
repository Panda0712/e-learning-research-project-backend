import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
// ============ COUPON CATEGORY VALIDATIONS ============
const createCouponCategory = async (req, res, next) => {
    const correctCondition = Joi.object({
        name: Joi.string().required().min(3).max(255),
        slug: Joi.string().required().min(3).max(255),
    });
    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const getCouponCategoryById = async (req, res, next) => {
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
const updateCouponCategory = async (req, res, next) => {
    const correctCondition = Joi.object({
        id: Joi.number().required().positive(),
    });
    const bodyCondition = Joi.object({
        name: Joi.string().optional().min(3).max(255),
        slug: Joi.string().optional().min(3).max(255),
    });
    try {
        await correctCondition.validateAsync(req.params, { abortEarly: false });
        await bodyCondition.validateAsync(req.body, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const deleteCouponCategory = async (req, res, next) => {
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
// ============ COUPON VALIDATIONS ============
const createCoupon = async (req, res, next) => {
    const correctCondition = Joi.object({
        courseId: Joi.number().integer().positive().optional(),
        name: Joi.string().required().min(2).max(100).trim().strict(),
        description: Joi.string().allow("").optional(),
        status: Joi.string().valid("active", "expired", "scheduled").required(),
        customerGroup: Joi.string().allow("").optional(),
        code: Joi.string().required().min(2).max(100).trim().strict(),
        categoryId: Joi.number().integer().positive().optional(),
        quantity: Joi.number().integer().optional().min(0),
        usesPerCustomer: Joi.number().integer().optional().min(0),
        priority: Joi.string().allow("").optional(),
        actions: Joi.string().allow("").optional(),
        type: Joi.string().valid("fixed", "percentage").required(),
        amount: Joi.number().required().min(0),
        startingDate: Joi.date().optional(),
        startingTime: Joi.string().allow("").optional(),
        endingDate: Joi.date().optional(),
        endingTime: Joi.string().allow("").optional(),
        isUnlimited: Joi.boolean().optional(),
    });
    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const getCouponById = async (req, res, next) => {
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
const getCouponByCode = async (req, res, next) => {
    const correctCondition = Joi.object({
        code: Joi.string().required().min(3).max(255),
    });
    try {
        await correctCondition.validateAsync(req.params, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const updateCoupon = async (req, res, next) => {
    const paramCondition = Joi.object({
        id: Joi.number().required().positive(),
    });
    const bodyCondition = Joi.object({
        courseId: Joi.number().integer().positive().optional(),
        name: Joi.string().min(2).max(100).trim().strict(),
        description: Joi.string().allow(""),
        status: Joi.string().valid("active", "expired", "scheduled"),
        customerGroup: Joi.string().allow(""),
        code: Joi.string().min(2).max(100).trim().strict(),
        categoryId: Joi.number().integer().positive(),
        quantity: Joi.number().integer().min(0),
        usesPerCustomer: Joi.number().integer().min(0),
        priority: Joi.string().allow(""),
        actions: Joi.string().allow(""),
        type: Joi.string().valid("fixed", "percentage"),
        amount: Joi.number().min(0),
        startingDate: Joi.date(),
        startingTime: Joi.string().allow(""),
        endingDate: Joi.date(),
        endingTime: Joi.string().allow(""),
        isUnlimited: Joi.boolean(),
    });
    try {
        await paramCondition.validateAsync(req.params, { abortEarly: false });
        await bodyCondition.validateAsync(req.body, {
            abortEarly: false,
            allowUnknown: true,
        });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
const deleteCoupon = async (req, res, next) => {
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
const verifyCouponCode = async (req, res, next) => {
    const correctCondition = Joi.object({
        code: Joi.string().required().min(3).max(255),
    });
    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false });
        next();
    }
    catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
    }
};
export const couponValidation = {
    // Category validations
    createCouponCategory,
    getCouponCategoryById,
    updateCouponCategory,
    deleteCouponCategory,
    // Coupon validations
    createCoupon,
    getCouponById,
    getCouponByCode,
    updateCoupon,
    deleteCoupon,
    verifyCouponCode,
};
//# sourceMappingURL=couponValidation.js.map