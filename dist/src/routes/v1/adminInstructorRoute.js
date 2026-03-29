import express from "express";
import { adminInstructorController } from "@/controllers/adminInstructorController.js";
const Router = express.Router();
Router.route("/").get(adminInstructorController.getAllRequests);
Router.route("/:id/approve").put(adminInstructorController.approveRequest);
Router.route("/:id/reject").put(adminInstructorController.rejectRequest);
export const adminInstructorRoute = Router;
//# sourceMappingURL=adminInstructorRoute.js.map