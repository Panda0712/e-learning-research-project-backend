
import { errorHandlingMiddleware } from "@/middlewares/errorHandlingMiddleware.js";
import { APIs_V1 } from "@/routes/v1/index.js";
import compression from "compression";
import cookieParser from "cookie-parser";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";

const app = express();

// init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(cookieParser());
app.use(compression());
app.use(express.json());
app.use((req: Request, res: Response, next: NextFunction) => {
  res.set("Cache-Control", "no-store");
  next();
});
app.use(
  express.urlencoded({
    extended: true,
  }),
);

// init routes
app.use("/v1", APIs_V1);

// handle error
app.use(errorHandlingMiddleware);

export default app;
