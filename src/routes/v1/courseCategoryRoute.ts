import express from "express";
import { courseCategoryController } from "@/controllers/courseCategoryController.js";


const Router = express.Router();

Router.route("/")
  .get(courseCategoryController.getAll)   
  .post(courseCategoryController.create); 

export const courseCategoryRoute = Router;