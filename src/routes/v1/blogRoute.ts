import { blogController } from "@/controllers/blogController.js";
import { blogValidation } from "@/validations/blogValidation.js";
import express from "express";

const Router = express.Router();

Router.route("/")
  .get(blogController.getAllBlogCategories)
  .post(blogValidation.createBlogCategory, blogController.createBlogCategory);

Router.route("/delete/:id").delete(
  blogValidation.deleteBlogCategory,
  blogController.deleteBlogCategory,
);

export const blogRoute = Router;
