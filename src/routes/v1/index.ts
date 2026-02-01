import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { blogRoute } from "./blogRoute.js";
import { cartRoute } from "./cartRoute.js";
import { courseRoute } from "./courseRoute.js";
import { userRoute } from "./userRoute.js";
import enrollmentRoute from "./enrollmentRoute.js"

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

// course route
Router.use("/courses", courseRoute);

// blog route
Router.use("/blogs", blogRoute);

//enrollment route
Router.use('/enrollments', enrollmentRoute);

// cart route
Router.use("/carts", cartRoute);

export const APIs_V1 = Router;
