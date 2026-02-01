import { cartController } from "@/controllers/cartController.js";
import { cartValidation } from "@/validations/cartValidation.js";
import express from "express";

const Router = express.Router();

Router.route("/get-cart-by-user-id").post(
  cartValidation.getCartByUserId,
  cartController.getCartByUserId,
);

Router.route("/add-to-cart").post(
  cartValidation.addToCart,
  cartController.addToCart,
);

Router.route("/remove-cart-item").delete(
  cartValidation.removeItem,
  cartController.removeItem,
);

export const cartRoute = Router;
