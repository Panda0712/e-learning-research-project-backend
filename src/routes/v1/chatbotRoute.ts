import { chatbotController } from "@/controllers/chatbotController.js";
import { authMiddleware } from "@/middlewares/authMiddleware.js";
import { chatbotValidation } from "@/validations/chatbotValidation.js";
import express from "express";

const Router = express.Router();

Router.route("/chat").post(chatbotValidation.chat, chatbotController.chat);

Router.route("/ingestion/status").get(
	authMiddleware.isAuthorized,
	chatbotController.getIngestionStatus,
);

Router.route("/ingestion/run").post(
	authMiddleware.isAuthorized,
	chatbotValidation.ingest,
	chatbotController.runIngestion,
);

export const chatbotRoute = Router;
