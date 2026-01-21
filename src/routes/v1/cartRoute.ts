import { cartController } from "@/controllers/cartController.js";
import express from "express";

const Router = express.Router();

// Dùng POST cho getCart để gửi userId trong body (theo controller đã viết)
Router.route("/get").post(cartController.getCart); 

Router.route("/add").post(cartController.addToCart);

Router.route("/remove/:id").delete(cartController.removeItem);

export const cartRoute = Router;