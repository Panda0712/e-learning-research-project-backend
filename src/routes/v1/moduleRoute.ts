import { moduleController } from "@/controllers/moduleController.js";
import { moduleValidation } from "@/validations/moduleValidation.js";
import express from "express";

const Router = express.Router();

Router.route("/").post(
  moduleValidation.createModule,
  moduleController.createModule,
);

Router.route("/:id")
  .get(moduleValidation.getModuleById, moduleController.getModuleById)
  .patch(moduleValidation.updateModule, moduleController.updateModule)
  .delete(moduleValidation.deleteModule, moduleController.deleteModule);

Router.route("/get-by-course-id/:courseId").get(
  moduleValidation.getAllModulesByCourseId,
  moduleController.getAllModulesByCourseId,
);

export const moduleRoute = Router;
