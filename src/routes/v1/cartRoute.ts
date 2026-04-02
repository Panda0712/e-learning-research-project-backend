import { cartController } from "@/controllers/cartController.js";
import { authMiddleware } from "@/middlewares/authMiddleware.js";
import { cartValidation } from "@/validations/cartValidation.js";
import express from "express";

const Router = express.Router();

Router.route("/get-cart-by-user-id").post(
  authMiddleware.isAuthorized,
  cartValidation.getCartByUserId,
  cartController.getCartByUserId,
);

Router.route("/add-to-cart").post(
  cartValidation.addToCart,
  cartController.addToCart,
);

Router.route("/remove-cart-item/:id").delete(
  cartValidation.removeItem,
  cartController.removeItem,
);

export const cartRoute = Router;
