import { errorHandlingMiddleware } from "@/middlewares/errorHandlingMiddleware.js";
import { APIs_V1 } from "@/routes/v1/index.js";
import compression from "compression";
import cookieParser from "cookie-parser";
import express, { Application, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { connectRabbitMQ } from "./lib/rabbitmq/rabbitmq.connection.js";
import { consumeMessage } from "./lib/rabbitmq/rabbitmq.consumer.js";

let appConfigured = false;
let rabbitMQInitialized = false;

const initRabbitMQ = async () => {
  if (rabbitMQInitialized) return;

  await connectRabbitMQ();
  await consumeMessage("test-queue");
  rabbitMQInitialized = true;
};

export const setupApp = async (app: Application) => {
  if (appConfigured) return;

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

  // init rabbitmq
  await initRabbitMQ();

  appConfigured = true;
};
