import { transactionValidation } from "@/validations/transactionValidation.js";
import express from "express";
import { transactionController } from "../../controllers/transactionController.js";

const Router = express.Router();

Router.route("/get-by-user-id/:userId").get(
  transactionValidation.getHistoryByUserId,
  transactionController.getHistoryByUserId,
);
Router.route("/create-new").post(
  transactionValidation.createTransaction,
  transactionController.createTransaction,
);

Router.route("/get-transaction-students/:courseId").get(
  transactionValidation.getStudentTransactionsByCourseId,
  transactionController.getStudentTransactionsByCourseId,
);

export const transactionRoute = Router;
