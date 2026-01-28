import { blogPostController } from "@/controllers/blogPostController.js";
import express from "express";

const Router = express.Router();

Router.route("/")
  .get(blogPostController.getAll)
  .post(blogPostController.create);

Router.route("/:id")
  .get(blogPostController.getById)
  .put(blogPostController.update)
  .delete(blogPostController.deletePost);

export const blogPostRoute = Router;