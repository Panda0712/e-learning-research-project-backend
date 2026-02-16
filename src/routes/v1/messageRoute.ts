import { messageController } from "@/controllers/messageController.js";
import { authMiddleware } from "@/middlewares/authMiddleware.js";
import { messageValidation } from "@/validations/messageValidation.js";
import express from "express";

const Router = express.Router();

Router.route("/direct").post(
  authMiddleware.isAuthorized,
  messageValidation.sendDirectMessage,
  messageController.sendDirectMessage,
);

export const messageRoute = Router;
