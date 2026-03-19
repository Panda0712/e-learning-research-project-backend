import express from "express";
import { adminInstructorController } from "@/controllers/adminInstructorController.js";
import { authMiddleware } from "@/middlewares/authMiddleware.js"; // Bật middleware nếu nhóm bắt buộc check quyền

const Router = express.Router();

// Tạm thời mình khoan gắn authMiddleware.isAdmin để bạn test Frontend cho dễ nhé.
// Sau này ráp xong thì thêm vào sau.
Router.route("/").get(adminInstructorController.getAllRequests);
Router.route("/:id/approve").put(adminInstructorController.approveRequest);
Router.route("/:id/reject").put(adminInstructorController.rejectRequest);

export const adminInstructorRoute = Router;