import { couponController } from "@/controllers/couponController.js";
import { couponValidation } from "@/validations/couponValidation.js";
import express from "express";

const Router = express.Router();

// ============ COUPON CATEGORY ROUTES ============

// Create coupon category
Router.route("/categories").post(
  couponValidation.createCouponCategory,
  couponController.createCouponCategory,
);

// Get all coupon categories
Router.route("/categories").get(couponController.getAllCouponCategories);

// Get coupon category by ID
Router.route("/categories/:id").get(
  couponValidation.getCouponCategoryById,
  couponController.getCouponCategoryById,
);

// Update coupon category
Router.route("/categories/:id").put(
  couponValidation.updateCouponCategory,
  couponController.updateCouponCategory,
);

// Delete coupon category
Router.route("/categories/:id").delete(
  couponValidation.deleteCouponCategory,
  couponController.deleteCouponCategory,
);

// ============ COUPON ROUTES ============

// Create coupon
Router.route("/").post(
  couponValidation.createCoupon,
  couponController.createCoupon,
);

// Get all coupons with pagination and filters
Router.route("/").get(couponController.getAllCoupons);

// Get coupon by ID
Router.route("/:id").get(
  couponValidation.getCouponById,
  couponController.getCouponById,
);

// Get coupon by code
Router.route("/code/:code").get(
  couponValidation.getCouponByCode,
  couponController.getCouponByCode,
);

// Verify coupon code
Router.route("/verify-code").post(
  couponValidation.verifyCouponCode,
  couponController.verifyCouponCode,
);

// Update coupon
Router.route("/:id").put(
  couponValidation.updateCoupon,
  couponController.updateCoupon,
);

// Delete coupon
Router.route("/:id").delete(
  couponValidation.deleteCoupon,
  couponController.deleteCoupon,
);

export const couponRoute = Router;
