import { blogCommentController } from "@/controllers/blogCommentController.js";
import express from "express";

const Router = express.Router();

Router.route("/add").post(blogCommentController.create);
Router.route("/delete/:id").delete(blogCommentController.deleteComment);

export const blogCommentRoute = Router;