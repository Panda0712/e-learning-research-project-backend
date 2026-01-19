import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
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

// user route
Router.use("/users", userRoute);

export const APIs_V1 = Router;
