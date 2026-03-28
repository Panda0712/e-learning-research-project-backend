import { blogController } from "@/controllers/blogController.js";
import { authMiddleware } from "@/middlewares/authMiddleware.js";
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
  .get(blogValidation.getAllPosts, blogController.getAllPosts)
  .post(
    authMiddleware.isAuthorized,
    blogValidation.createPost,
    blogController.createPost,
  );

Router.route("/blogPost/:id")
  .get(blogController.getPostDetail)
  .put(
    authMiddleware.isAuthorized,
    blogValidation.updatePost,
    blogController.updatePost,
  )
  .delete(
    authMiddleware.isAuthorized,
    blogValidation.deletePost,
    blogController.deletePost,
  );

Router.route("/thumbnail").post(
  authMiddleware.isAuthorized,
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
