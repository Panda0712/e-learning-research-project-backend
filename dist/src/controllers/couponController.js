import { couponService } from "@/services/couponService.js";
import { StatusCodes } from "http-status-codes";
const createCouponCategory = async (req, res, next) => {
    try {
        const newCategory = await couponService.createCouponCategory(req.body);
        res.status(StatusCodes.CREATED).json(newCategory);
    }
    catch (error) {
        next(error);
    }
};
const getAllCouponCategories = async (req, res, next) => {
    try {
        const categories = await couponService.getAllCouponCategories();
        res.status(StatusCodes.OK).json(categories);
    }
    catch (error) {
        next(error);
    }
};
const getCouponCategoryById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await couponService.getCouponCategoryById(Number(id));
        res.status(StatusCodes.OK).json(category);
    }
    catch (error) {
        next(error);
    }
};
const updateCouponCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updated = await couponService.updateCouponCategory(Number(id), req.body);
        res.status(StatusCodes.OK).json(updated);
    }
    catch (error) {
        next(error);
    }
};
const deleteCouponCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        await couponService.deleteCouponCategory(Number(id));
        res
            .status(StatusCodes.OK)
            .json({ message: "Coupon category deleted successfully!" });
    }
    catch (error) {
        next(error);
    }
};
// ============ COUPON CONTROLLERS ============
const createCoupon = async (req, res, next) => {
    try {
        const newCoupon = await couponService.createCoupon(req.body);
        res.status(StatusCodes.CREATED).json(newCoupon);
    }
    catch (error) {
        next(error);
    }
};
const getAllCoupons = async (req, res, next) => {
    try {
        const { page, limit, status, courseId } = req.query;
        const filterParams = {};
        if (page)
            filterParams.page = Number(page);
        if (limit)
            filterParams.limit = Number(limit);
        if (status)
            filterParams.status = String(status);
        if (courseId)
            filterParams.courseId = Number(courseId);
        const coupons = await couponService.getAllCoupons(filterParams);
        res.status(StatusCodes.OK).json(coupons);
    }
    catch (error) {
        next(error);
    }
};
const getCouponById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const coupon = await couponService.getCouponById(Number(id));
        res.status(StatusCodes.OK).json(coupon);
    }
    catch (error) {
        next(error);
    }
};
const getCouponByCode = async (req, res, next) => {
    try {
        const { code } = req.params;
        const coupon = await couponService.getCouponByCode(code);
        res.status(StatusCodes.OK).json(coupon);
    }
    catch (error) {
        next(error);
    }
};
const updateCoupon = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updated = await couponService.updateCoupon(Number(id), req.body);
        res.status(StatusCodes.OK).json(updated);
    }
    catch (error) {
        next(error);
    }
};
const deleteCoupon = async (req, res, next) => {
    try {
        const { id } = req.params;
        await couponService.deleteCoupon(Number(id));
        res
            .status(StatusCodes.OK)
            .json({ message: "Coupon deleted successfully!" });
    }
    catch (error) {
        next(error);
    }
};
const verifyCouponCode = async (req, res, next) => {
    try {
        const { code } = req.body;
        const result = await couponService.verifyCouponCode(code);
        res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
export const couponController = {
    // Coupon Category controllers
    createCouponCategory,
    getAllCouponCategories,
    getCouponCategoryById,
    updateCouponCategory,
    deleteCouponCategory,
    // Coupon controllers
    createCoupon,
    getAllCoupons,
    getCouponById,
    getCouponByCode,
    updateCoupon,
    deleteCoupon,
    verifyCouponCode,
};
//# sourceMappingURL=couponController.js.map