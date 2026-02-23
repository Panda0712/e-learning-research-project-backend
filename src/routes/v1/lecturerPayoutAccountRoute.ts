import { lecturerPayoutAccountController } from "@/controllers/lecturerPayoutAccountController.js";
import { lecturerPayoutAccountValidation } from "@/validations/lecturerPayoutAccountValidation.js";
import express from "express";

const Router = express.Router();

// Create lecturer payout account
Router.route("/").post(
  lecturerPayoutAccountValidation.createLecturerPayoutAccount,
  lecturerPayoutAccountController.createLecturerPayoutAccount,
);

// Get all lecturer payout accounts (admin)
Router.route("/").get(
  lecturerPayoutAccountController.getAllLecturerPayoutAccounts,
);

// Get lecturer payout account by ID
Router.route("/:id").get(
  lecturerPayoutAccountValidation.getLecturerPayoutAccountById,
  lecturerPayoutAccountController.getLecturerPayoutAccountById,
);

// Get payout accounts by lecturer ID
Router.route("/lecturer/:lecturerId").get(
  lecturerPayoutAccountValidation.getPayoutAccountsByLecturerId,
  lecturerPayoutAccountController.getPayoutAccountsByLecturerId,
);

// Get default payout account by lecturer ID
Router.route("/lecturer/:lecturerId/default").get(
  lecturerPayoutAccountValidation.getDefaultPayoutAccount,
  lecturerPayoutAccountController.getDefaultPayoutAccount,
);

// Update lecturer payout account
Router.route("/:id").put(
  lecturerPayoutAccountValidation.updateLecturerPayoutAccount,
  lecturerPayoutAccountController.updateLecturerPayoutAccount,
);

// Set default payout account
Router.route("/:id/default").put(
  lecturerPayoutAccountValidation.setDefaultPayoutAccount,
  lecturerPayoutAccountController.setDefaultPayoutAccount,
);

// Delete lecturer payout account
Router.route("/:id").delete(
  lecturerPayoutAccountValidation.deleteLecturerPayoutAccount,
  lecturerPayoutAccountController.deleteLecturerPayoutAccount,
);

export const lecturerPayoutAccountRoute = Router;
