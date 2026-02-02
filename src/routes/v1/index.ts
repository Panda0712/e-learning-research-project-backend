import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { assessmentRoute } from "./assessmentRoute.js";
import { blogRoute } from "./blogRoute.js";
import { cartRoute } from "./cartRoute.js";
import { courseRoute } from "./courseRoute.js";
import { enrollmentRoute } from "./enrollmentRoute.js";
import { transactionRoute } from "./transactionRoute.js";
import { userRoute } from "./userRoute.js";
import { blogPostRoute } from "./blogRoute.js";
import { blogCommentRoute } from "./blogCommentRoute.js";

const Router = express.Router();

// check api v1 status
Router.get("/status", (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    message: "API V1 are ready to use!",
    code: StatusCodes.OK,
    timestamp: new Date().toISOString(),
  });
});

// user route
Router.use("/users", userRoute);

// Blog Post
Router.use("/blog-posts", blogPostRoute);

// Blog Comment
Router.use("/blog-comments", blogCommentRoute);
// course route
Router.use("/courses", courseRoute);

// blog route
Router.use("/blogs", blogRoute);

//enrollment route
Router.use("/enrollments", enrollmentRoute);

//transaction route
Router.use("/transactions", transactionRoute);

// cart route
Router.use("/carts", cartRoute);

//assessment route
Router.use("/assessments", assessmentRoute);

export const APIs_V1 = Router;
