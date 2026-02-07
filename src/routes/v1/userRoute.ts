import { userController } from "@/controllers/userController.js";
import { userValidation } from "@/validations/userValidation.js";
import express from "express";

const Router = express.Router();

Router.route("/register").post(
  userValidation.register,
  userController.register,
);

Router.route("/verify").put(
  userValidation.verifyAccount,
  userController.verifyAccount,
);

Router.route("/register-lecturer").post(
  userValidation.registerLecturer,
  userController.registerLecturerProfile,
);

Router.route("/login").post(userValidation.login, userController.login);

Router.route("/logout").delete(userController.logout);

Router.route("/refresh_token").get(userController.handleRefreshToken);

Router.route("/update").put(
  userValidation.update,
  userController.updateProfile,
);

Router.route("/forgot-password").post(
  userValidation.forgotPassword,
  userController.forgotPassword,
);

Router.route("/reset-password").post(
  userValidation.resetPassword,
  userController.resetPassword,
);

export const userRoute = Router;
