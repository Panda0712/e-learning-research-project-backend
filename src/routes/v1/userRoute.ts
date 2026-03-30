import { authMiddleware } from "./../../middlewares/authMiddleware.js";
import { userController } from "@/controllers/userController.js";
import { multerUploadMiddleware } from "@/middlewares/multerUploadMiddleware.js";
import { userValidation } from "@/validations/userValidation.js";
import ApiError from "@/utils/ApiError.js";
import express from "express";
import { StatusCodes } from "http-status-codes";

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
  authMiddleware.isAuthorized,
  userValidation.registerLecturer,
  userController.registerLecturerProfile,
);

Router.route("/login").post(userValidation.login, userController.login);

Router.route("/logout").delete(
  authMiddleware.isAuthorized,
  userController.logout,
);

Router.route("/refresh_token").get(userController.handleRefreshToken);

Router.route("/update").put(
  authMiddleware.isAuthorized,
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

Router.route("/avatar").post(
  authMiddleware.isAuthorized,
  multerUploadMiddleware.uploadImage.single("images"),
  userController.uploadAvatar,
);

Router.route("/lecturer-file").post(
  multerUploadMiddleware.uploadDoc.single("files"),
  userController.uploadLecturerFile,
);

Router.route("/google").get(userController.googleAuthStartHandler);

Router.route("/google/callback").get(userController.googleAuthCallbackHandler);

Router.route("/facebook").post(userController.facebookAuthHandler);

Router.route("/me").get(authMiddleware.isAuthorized, userController.getMe);

Router.route("/admin/users").get(
  authMiddleware.isAuthorized,
  userValidation.getAdminUsers,
  userController.getAdminUsers,
);

Router.route("/admin/users/:id").get(
  authMiddleware.isAuthorized,
  userValidation.getAdminUserDetail,
  userController.getAdminUserDetail,
);

Router.route("/admin/users/:id/block").patch(
  authMiddleware.isAuthorized,
  userValidation.blockUser,
  userController.blockUser,
);

Router.route("/admin/users/:id").delete(
  authMiddleware.isAuthorized,
  userValidation.deleteUser,
  userController.deleteUser,
);

export const userRoute = Router;
