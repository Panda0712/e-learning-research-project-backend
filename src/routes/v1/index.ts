import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { assessmentRoute } from "./assessmentRoute.js";
import { blogRoute } from "./blogRoute.js";
import { cartRoute } from "./cartRoute.js";
import { conversationRoute } from "./conversationRoute.js";
import { couponRoute } from "./couponRoute.js";
import { courseRoute } from "./courseRoute.js";
import { dashboardRoute } from "./dashboardRoute.js";
import { enrollmentRoute } from "./enrollmentRoute.js";
import { lecturerPayoutRoute } from "./lecturerPayoutRoute.js";
import { lecturerPayoutAccountRoute } from "./lecturerPayoutAccountRoute.js";
import { lessonRoute } from "./lessonRoute.js";
import { messageRoute } from "./messageRoute.js";
import { moduleRoute } from "./moduleRoute.js";
import { orderItemRoute } from "./orderItemRoute.js";
import { orderRoute } from "./orderRoute.js";
import { questionRoute } from "./questionRoute.js";
import { quizRoute } from "./quizRoute.js";
import { resourceRoute } from "./resourceRoute.js";
import { transactionRoute } from "./transactionRoute.js";
import { userRoute } from "./userRoute.js";

const Router = express.Router();

// check api v1 status
Router.get("/status", (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    message: "API V1 are ready to use!",
    code: StatusCodes.OK,
    timestamp: new Date().toISOString(),
  });
});

// User route
Router.use("/users", userRoute);

// Dashboard Route
Router.use("/dashboard", dashboardRoute);

// Course route
Router.use("/courses", courseRoute);

// Blog route
Router.use("/blogs", blogRoute);

// Enrollment route
Router.use("/enrollments", enrollmentRoute);

// Transaction route
Router.use("/transactions", transactionRoute);

// Cart route
Router.use("/carts", cartRoute);

// Coupon route
Router.use("/coupons", couponRoute);

// Order route
Router.use("/orders", orderRoute);

// OrderItem route
Router.use("/order-items", orderItemRoute);

// Assessment route
Router.use("/assessments", assessmentRoute);

// Quiz route
Router.use("/quizzes", quizRoute);

// Question route
Router.use("/questions", questionRoute);

// Module route
Router.use("/modules", moduleRoute);

// Lesson route
Router.use("/lessons", lessonRoute);

// Conversation route
Router.use("/conversations", conversationRoute);

// Message route
Router.use("/messages", messageRoute);

// Resource route
Router.use("/resources", resourceRoute);

// Lecturer Payout route
Router.use("/lecturer-payouts", lecturerPayoutRoute);

// Lecturer Payout Account route
Router.use("/lecturer-payout-accounts", lecturerPayoutAccountRoute);

export const APIs_V1 = Router;
