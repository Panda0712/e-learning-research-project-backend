import { userController } from "@/controllers/userController.js";
import { userValidation } from "@/validations/userValidation.js";
import express from "express";

const Router = express.Router();

Router.route("/register").post(
  userValidation.register,
  userController.register,
);
Router.route("/login").post(userValidation.login, userController.login);

Router.route("/logout").delete(userController.logout);

Router.route("/refresh_token").get(userController.handleRefreshToken);

export const userRoute = Router;
