import { homepageController } from "@/controllers/homepageController.js";
import { homepageValidation } from "@/validations/homepageValidation.js";
import express from "express";
const Router = express.Router();
Router.get("/", homepageValidation.getHomepageData, homepageController.getHomepageData);
export const homepageRoute = Router;
//# sourceMappingURL=homepageRoute.js.map