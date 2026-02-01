import { blogCategoryController } from "@/controllers/blogCategoryController.js";
import express from "express";

const Router = express.Router();

Router.route("/")
  .get(blogCategoryController.getAll)
  .post(blogCategoryController.create);

Router.route("/:id").delete(blogCategoryController.deleteCategory);

export const blogCategoryRoute = Router;