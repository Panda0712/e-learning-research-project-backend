import { blogController } from "@/controllers/blogController.js";
import { multerUploadMiddleware } from "@/middlewares/multerUploadMiddleware.js";
import { blogValidation } from "@/validations/blogValidation.js";
import express from "express";

const Router = express.Router();

// BLOG CATEGORY ROUTE
Router.route("/categories")
  .get(blogController.getAllBlogCategories)
  .post(blogValidation.createBlogCategory, blogController.createBlogCategory);

Router.route("/categories/:id")
  .put(blogValidation.updateBlogCategory, blogController.updateBlogCategory)
  .delete(blogValidation.deleteBlogCategory, blogController.deleteBlogCategory);

// BLOG POST ROUTE
Router.route("/blogPost")
  .get(blogController.getAllPosts)
  .post(blogValidation.createPost, blogController.createPost);

Router.route("/blogPost/:id")
  .get(blogController.getPostDetail)
  .put(blogValidation.updatePost, blogController.updatePost)
  .delete(blogValidation.deletePost, blogController.deletePost);

Router.route("/thumbnail").post(
  multerUploadMiddleware.uploadImage.single("images"),
  blogController.uploadBlogThumbnail,
);

// BLOG COMMENT ROUTE
Router.route("/blogComments").post(
  blogValidation.createComment,
  blogController.createComment,
);

Router.route("/blogComments/:id")
  .put(blogValidation.updateComment, blogController.updateComment)
  .delete(blogValidation.deleteComment, blogController.deleteComment);

export const blogRoute = Router;
