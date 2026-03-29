import { blogController } from "@/controllers/blogController.js";
import { authMiddleware } from "@/middlewares/authMiddleware.js";
import { multerUploadMiddleware } from "@/middlewares/multerUploadMiddleware.js";
import ApiError from "@/utils/ApiError.js";
import { blogValidation } from "@/validations/blogValidation.js";
import express from "express";
import { StatusCodes } from "http-status-codes";

const Router = express.Router();

const adminOnly = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction,
) => {
  if (req.jwtDecoded?.role !== "admin") {
    return next(
      new ApiError(
        StatusCodes.FORBIDDEN,
        "Forbidden: You don't have permission!",
      ),
    );
  }
  next();
};

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

Router.route("/admin/posts").get(
  authMiddleware.isAuthorized,
  adminOnly,
  blogController.getAdminPosts,
);

Router.route("/admin/posts/:id").get(
  authMiddleware.isAuthorized,
  adminOnly,
  blogController.getAdminPostDetail,
);

Router.route("/admin/posts").post(
  authMiddleware.isAuthorized,
  adminOnly,
  blogValidation.createPost,
  blogController.createPost,
);

Router.route("/admin/posts/:id").put(
  authMiddleware.isAuthorized,
  adminOnly,
  blogValidation.updatePost,
  blogController.updatePost,
);

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
