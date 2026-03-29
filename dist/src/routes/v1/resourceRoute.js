import { resourceController } from "@/controllers/resourceController.js";
import { authMiddleware } from "@/middlewares/authMiddleware.js";
import { resourceValidation } from "@/validations/resourceValidation.js";
import express from "express";
const Router = express.Router();
Router.route("/").post(authMiddleware.isAuthorized, resourceValidation.createResource, resourceController.createResource);
Router.route("/:id")
    .get(authMiddleware.isAuthorized, resourceValidation.getResourceById, resourceController.getResourceById)
    .delete(resourceValidation.deleteResource, resourceController.deleteResource);
Router.route("/publicId/:publicId")
    .get(resourceValidation.getResourceByPublicId, resourceController.getResourceByPublicId)
    .delete(authMiddleware.isAuthorized, resourceValidation.deleteResourceByPublicId, resourceController.deleteResourceByPublicId);
Router.route("/type/:fileType").get(resourceValidation.getAllResourcesByFileType, resourceController.getAllResourcesByFileType);
export const resourceRoute = Router;
//# sourceMappingURL=resourceRoute.js.map