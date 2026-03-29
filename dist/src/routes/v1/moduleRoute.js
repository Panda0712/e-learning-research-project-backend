import { moduleController } from "@/controllers/moduleController.js";
import { authMiddleware } from "@/middlewares/authMiddleware.js";
import { moduleValidation } from "@/validations/moduleValidation.js";
import express from "express";
const Router = express.Router();
Router.route("/").post(authMiddleware.isAuthorized, moduleValidation.createModule, moduleController.createModule);
Router.route("/:id")
    .get(moduleValidation.getModuleById, moduleController.getModuleById)
    .patch(authMiddleware.isAuthorized, moduleValidation.updateModule, moduleController.updateModule)
    .delete(authMiddleware.isAuthorized, moduleValidation.deleteModule, moduleController.deleteModule);
Router.route("/get-by-course-id/:courseId").get(moduleValidation.getAllModulesByCourseId, moduleController.getAllModulesByCourseId);
Router.route("/learning/get-by-course-id/:courseId").get(authMiddleware.isAuthorized, moduleValidation.getAllModulesByCourseId, moduleController.getAllModulesByCourseId);
export const moduleRoute = Router;
//# sourceMappingURL=moduleRoute.js.map