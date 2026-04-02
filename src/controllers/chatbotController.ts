import { chatbotService } from "@/services/chatbotService.js";
import { ragIngestionService } from "@/services/ragIngestionService.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const chat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = String(req.body.question || "").trim();
    const topK = req.body.topK ? Number(req.body.topK) : undefined;
    const requestConversationId = req.body.conversationId
      ? String(req.body.conversationId)
      : undefined;
    const jwtUserId = req.jwtDecoded?.id ? String(req.jwtDecoded.id) : undefined;
    const numericUserId = req.jwtDecoded?.id ? Number(req.jwtDecoded.id) : undefined;
    const ipValue = req.ip || req.socket.remoteAddress || "anonymous";
    const fallbackConversationId = `anon-${ipValue.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
    const conversationId = requestConversationId || jwtUserId || fallbackConversationId;

    const payload = {
      question,
      conversationId,
      ...(typeof numericUserId === "number" && Number.isInteger(numericUserId)
        ? { userId: numericUserId }
        : {}),
      ...(typeof topK === "number" ? { topK } : {}),
    };

    const result = await chatbotService.chat(payload);

    res.status(StatusCodes.OK).json({
      message: "Chatbot response generated successfully.",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const getIngestionStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const status = ragIngestionService.getStatus();
    res.status(StatusCodes.OK).json({
      message: "RAG ingestion status fetched successfully.",
      ...status,
    });
  } catch (error) {
    next(error);
  }
};

const runIngestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const forceReindex = Boolean(req.body?.forceReindex);
    const report = await ragIngestionService.runIngestion({ forceReindex });

    res.status(StatusCodes.OK).json({
      message: "RAG ingestion executed.",
      report,
    });
  } catch (error) {
    next(error);
  }
};

export const chatbotController = {
  chat,
  getIngestionStatus,
  runIngestion,
};
