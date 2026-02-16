import { couponService } from "@/services/couponService.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const createCouponCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const newCategory = await couponService.createCouponCategory(req.body);
    res.status(StatusCodes.CREATED).json(newCategory);
  } catch (error) {
    next(error);
  }
};

const getAllCouponCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await couponService.getAllCouponCategories();
    res.status(StatusCodes.OK).json(categories);
  } catch (error) {
    next(error);
  }
};

const getCouponCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const category = await couponService.getCouponCategoryById(Number(id));
    res.status(StatusCodes.OK).json(category);
  } catch (error) {
    next(error);
  }
};

const updateCouponCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const updated = await couponService.updateCouponCategory(
      Number(id),
      req.body,
    );
    res.status(StatusCodes.OK).json(updated);
  } catch (error) {
    next(error);
  }
};

const deleteCouponCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    await couponService.deleteCouponCategory(Number(id));
    res
      .status(StatusCodes.OK)
      .json({ message: "Coupon category deleted successfully!" });
  } catch (error) {
    next(error);
  }
};

// ============ COUPON CONTROLLERS ============

const createCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const newCoupon = await couponService.createCoupon(req.body);
    res.status(StatusCodes.CREATED).json(newCoupon);
  } catch (error) {
    next(error);
  }
};

const getAllCoupons = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, status } = req.query;
    const filterParams: any = {};

    if (page) filterParams.page = Number(page);
    if (limit) filterParams.limit = Number(limit);
    if (status) filterParams.status = String(status);

    const coupons = await couponService.getAllCoupons(filterParams);
    res.status(StatusCodes.OK).json(coupons);
  } catch (error) {
    next(error);
  }
};

const getCouponById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const coupon = await couponService.getCouponById(Number(id));
    res.status(StatusCodes.OK).json(coupon);
  } catch (error) {
    next(error);
  }
};

const getCouponByCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { code } = req.params as { code: string };
    const coupon = await couponService.getCouponByCode(code);
    res.status(StatusCodes.OK).json(coupon);
  } catch (error) {
    next(error);
  }
};

const updateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const updated = await couponService.updateCoupon(Number(id), req.body);
    res.status(StatusCodes.OK).json(updated);
  } catch (error) {
    next(error);
  }
};

const deleteCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    await couponService.deleteCoupon(Number(id));
    res
      .status(StatusCodes.OK)
      .json({ message: "Coupon deleted successfully!" });
  } catch (error) {
    next(error);
  }
};

const verifyCouponCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { code } = req.body;
    const result = await couponService.verifyCouponCode(code);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
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
