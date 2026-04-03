import { cartController } from "@/controllers/cartController.js";
import { authMiddleware } from "@/middlewares/authMiddleware.js";
import { cartValidation } from "@/validations/cartValidation.js";
import express from "express";

const Router = express.Router();

Router.route("/get-cart-by-user-id/:userId").get(
  authMiddleware.isAuthorized,
  cartValidation.getCartByUserId,
  cartController.getCartByUserId,
);

Router.route("/add-to-cart").post(
  authMiddleware.isAuthorized,
  cartValidation.addToCart,
  cartController.addToCart,
);

Router.route("/remove-cart-item/:id").delete(
  authMiddleware.isAuthorized,
  cartValidation.removeItem,
  cartController.removeItem,
);

export const cartRoute = Router;
