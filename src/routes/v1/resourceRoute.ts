import { resourceController } from "@/controllers/resourceController.js";
import { resourceValidation } from "@/validations/resourceValidation.js";
import express from "express";

const Router = express.Router();

Router.route("/").post(
  resourceValidation.createResource,
  resourceController.createResource,
);

Router.route("/:id")
  .get(resourceValidation.getResourceById, resourceController.getResourceById)
  .delete(resourceValidation.deleteResource, resourceController.deleteResource);

Router.route("/publicId/:publicId")
  .get(
    resourceValidation.getResourceByPublicId,
    resourceController.getResourceByPublicId,
  )
  .delete(
    resourceValidation.deleteResourceByPublicId,
    resourceController.deleteResourceByPublicId,
  );

Router.route("/type/:fileType").get(
  resourceValidation.getAllResourcesByFileType,
  resourceController.getAllResourcesByFileType,
);

export const resourceRoute = Router;
