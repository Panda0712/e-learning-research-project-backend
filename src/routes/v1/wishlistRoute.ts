import { wishlistController } from "@/controllers/wishlistController.js";
import { authMiddleware } from "@/middlewares/authMiddleware.js";
import { wishlistValidation } from "@/validations/wishlistValidation.js";
import express from "express";

const Router = express.Router();

// Create wishlist
Router.route("/").post(
  authMiddleware.isAuthorized,
  wishlistValidation.createWishlist,
  wishlistController.createWishlist,
);

// Get all wishlists (admin)
Router.route("/all").get(wishlistController.getAllWishlists);

// Get my wishlists
Router.route("/me").get(
  authMiddleware.isAuthorized,
  wishlistController.getMyWishlists,
);

Router.route("/me/check/:courseId").get(
  authMiddleware.isAuthorized,
  wishlistValidation.checkCourseInWishlist,
  wishlistController.checkMyCourseInWishlist,
);

// Get wishlist by ID
Router.route("/:id").get(
  wishlistValidation.getWishlistById,
  wishlistController.getWishlistById,
);

// Get wishlists by user ID
Router.route("/user/:userId").get(
  authMiddleware.isAuthorized,
  wishlistValidation.getWishlistsByUserId,
  wishlistController.getWishlistsByUserId,
);

// Check if course is in wishlist
Router.route("/check/:userId/:courseId").get(
  wishlistValidation.checkCourseInWishlist,
  wishlistController.checkCourseInWishlist,
);

// Update wishlist
Router.route("/:id").put(
  wishlistValidation.updateWishlist,
  wishlistController.updateWishlist,
);

Router.route("/me/course/:courseId").delete(
  authMiddleware.isAuthorized,
  wishlistValidation.deleteMyWishlistByCourse,
  wishlistController.deleteWishlistByCourse,
);

// Delete wishlist by ID
Router.route("/:id").delete(
  authMiddleware.isAuthorized,
  wishlistValidation.deleteWishlist,
  wishlistController.deleteWishlist,
);

// Delete wishlist by course
Router.route("/user/:userId/course/:courseId").delete(
  wishlistValidation.deleteWishlistByCourse,
  wishlistController.deleteWishlistByCourse,
);

export const wishlistRoute = Router;
