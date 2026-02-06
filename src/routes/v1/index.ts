import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { assessmentRoute } from "./assessmentRoute.js";
import { blogRoute } from "./blogRoute.js";
import { cartRoute } from "./cartRoute.js";
import { courseRoute } from "./courseRoute.js";
import { dashboardRoute } from "./dashboardRoute.js";
import { enrollmentRoute } from "./enrollmentRoute.js";
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

// Assessment route
Router.use("/assessments", assessmentRoute);

export const APIs_V1 = Router;
