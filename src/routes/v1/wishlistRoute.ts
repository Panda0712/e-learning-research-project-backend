import { wishlistController } from "@/controllers/wishlistController.js";
import { wishlistValidation } from "@/validations/wishlistValidation.js";
import express from "express";

const Router = express.Router();

// Create wishlist
Router.route("/").post(
  wishlistValidation.createWishlist,
  wishlistController.createWishlist,
);

// Get all wishlists (admin)
Router.route("/").get(wishlistController.getAllWishlists);

// Get wishlist by ID
Router.route("/:id").get(
  wishlistValidation.getWishlistById,
  wishlistController.getWishlistById,
);

// Get wishlists by user ID
Router.route("/user/:userId").get(
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

// Delete wishlist by ID
Router.route("/:id").delete(
  wishlistValidation.deleteWishlist,
  wishlistController.deleteWishlist,
);

// Delete wishlist by course
Router.route("/user/:userId/course/:courseId").delete(
  wishlistValidation.deleteWishlistByCourse,
  wishlistController.deleteWishlistByCourse,
);

export const wishlistRoute = Router;
