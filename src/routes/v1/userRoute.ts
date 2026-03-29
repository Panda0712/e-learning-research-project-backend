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

const adminOnly = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction,
) => {
  if (req.jwtDecoded?.role !== "admin") {
    return next(
      new ApiError(
        StatusCodes.FORBIDDEN,
        "Forbidden: You don't have permission!",
      ),
    );
  }
  next();
};

Router.route("/admin/list").get(
  authMiddleware.isAuthorized,
  adminOnly,
  userController.getAdminUsers,
);

Router.route("/admin/:id/detail").get(
  authMiddleware.isAuthorized,
  adminOnly,
  userController.getAdminUserDetail,
);

Router.route("/admin/:id/block").patch(
  authMiddleware.isAuthorized,
  adminOnly,
  userController.blockUser,
);

Router.route("/admin/:id").delete(
  authMiddleware.isAuthorized,
  adminOnly,
  userController.deleteUser,
);

export const userRoute = Router;
