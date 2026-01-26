import express, { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { userRoute } from "./userRoute.js";
import { courseCategoryRoute } from "./courseCategoryRoute.js";
import  courseFaqRoute from "./courseFaqRoute.js";
import enrollmentRoute from "./enrollmentRoute.js";
import transactionRoute from './transactionRoute.js';
import transactionStudentRoute from './transactionStudentRoute.js';
import assessmentRoute from './assessmentRoute.js';

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

// courseCategories route
Router.use('/categories', courseCategoryRoute);

// courseFaq route
Router.use('/faqs', courseFaqRoute);

//enrollment route
Router.use('/enrollments', enrollmentRoute);

//transaction route
Router.use('/transactions', transactionRoute);

//transactionStuden route
Router.use('/transaction-students', transactionStudentRoute);

//assessment route
Router.use('/assessments', assessmentRoute);

export const APIs_V1 = Router;
