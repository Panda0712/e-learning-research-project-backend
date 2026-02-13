import { lessonController } from "@/controllers/lessonController.js";
import { multerUploadMiddleware } from "@/middlewares/multerUploadMiddleware.js";
import { lessonValidation } from "@/validations/lessonValidation.js";
import express from "express";

const Router = express.Router();

Router.route("/").post(
  lessonValidation.createLesson,
  lessonController.createLesson,
);

Router.route("/:id")
  .get(lessonValidation.getLessonById, lessonController.getLessonById)
  .patch(lessonValidation.updateLesson, lessonController.updateLesson)
  .delete(lessonValidation.deleteLesson, lessonController.deleteLesson);

Router.route("/get-by-module-id/:moduleId").get(
  lessonValidation.getAllLessonsByModuleId,
  lessonController.getAllLessonsByModuleId,
);

Router.route("/get-by-resource-id/:resourceId").get(
  lessonValidation.getLessonByResourceId,
  lessonController.getLessonByResourceId,
);

Router.route("/uploads/files").post(
  multerUploadMiddleware.uploadDoc.array("files", 5),
  lessonController.uploadLessonFiles,
);

Router.route("/uploads/videos").post(
  multerUploadMiddleware.uploadVideoLarge.array("videos", 3),
  lessonController.uploadLessonVideos,
);

export const lessonRoute = Router;
