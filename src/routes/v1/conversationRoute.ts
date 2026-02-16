import { conversationController } from "@/controllers/conversationController.js";
import { authMiddleware } from "@/middlewares/authMiddleware.js";
import { conversationValidation } from "@/validations/conversationValidation.js";
import express from "express";

const Router = express.Router();

Router.route("/")
  .post(
    authMiddleware.isAuthorized,
    conversationValidation.createConversation,
    conversationController.createConversation,
  )
  .get(authMiddleware.isAuthorized, conversationController.getConversations);

Router.route("/:conversationId/messages").get(
  authMiddleware.isAuthorized,
  conversationValidation.getMessages,
  conversationController.getMessages,
);

Router.route("/:conversationId/seen").patch(
  authMiddleware.isAuthorized,
  conversationValidation.markAsSeen,
  conversationController.markAsSeen,
);

export const conversationRoute = Router;
