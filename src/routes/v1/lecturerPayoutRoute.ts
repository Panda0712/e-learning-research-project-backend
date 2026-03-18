import { lecturerPayoutController } from "@/controllers/lecturerPayoutController.js";
import { lecturerPayoutValidation } from "@/validations/lecturerPayoutValidation.js";
import express from "express";

const Router = express.Router();

// Create lecturer payout
Router.route("/").post(
  lecturerPayoutValidation.createLecturerPayout,
  lecturerPayoutController.createLecturerPayout,
);

// Get all lecturer payouts (admin)
Router.route("/").get(lecturerPayoutController.getAllLecturerPayouts);

// Get lecturer payout by ID
Router.route("/:id").get(
  lecturerPayoutValidation.getLecturerPayoutById,
  lecturerPayoutController.getLecturerPayoutById,
);

// Get payouts by lecturer ID
Router.route("/lecturer/:lecturerId").get(
  lecturerPayoutValidation.getPayoutsByLecturerId,
  lecturerPayoutController.getPayoutsByLecturerId,
);

// Update lecturer payout
Router.route("/:id").put(
  lecturerPayoutValidation.updateLecturerPayout,
  lecturerPayoutController.updateLecturerPayout,
);

// Update payout status
Router.route("/:id/status").put(
  lecturerPayoutValidation.updatePayoutStatus,
  lecturerPayoutController.updatePayoutStatus,
);

// Delete lecturer payout
Router.route("/:id").delete(
  lecturerPayoutValidation.deleteLecturerPayout,
  lecturerPayoutController.deleteLecturerPayout,
);

export const lecturerPayoutRoute = Router;
