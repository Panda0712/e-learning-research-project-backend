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
  const role = String(req.jwtDecoded?.role || "")
    .trim()
    .toLowerCase();

  if (role !== "admin") {
    return next(
      new ApiError(
        StatusCodes.FORBIDDEN,
        "Forbidden: You don't have permission!",
      ),
    );
  }
  next();
};

const lecturerOrAdmin = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction,
) => {
  const role = String(req.jwtDecoded?.role || "").toLowerCase();

  if (role !== "admin" && role !== "lecturer") {
    return next(
      new ApiError(
        StatusCodes.FORBIDDEN,
        "Forbidden: Only admin or lecturer can perform this action!",
      ),
    );
  }

  next();
};

// BLOG CATEGORY ROUTE
Router.route("/categories")
  .get(blogController.getAllBlogCategories)
  .post(
    authMiddleware.isAuthorized,
    lecturerOrAdmin,
    blogValidation.createBlogCategory,
    blogController.createBlogCategory,
  );

Router.route("/categories/:id")
  .put(
    authMiddleware.isAuthorized,
    adminOnly,
    blogValidation.updateBlogCategory,
    blogController.updateBlogCategory,
  )
  .delete(
    authMiddleware.isAuthorized,
    adminOnly,
    blogValidation.deleteBlogCategory,
    blogController.deleteBlogCategory,
  );

// BLOG POST ROUTE
Router.route("/blogPost")
  .get(blogValidation.getAllPosts, blogController.getAllPosts)
  .post(
    authMiddleware.isAuthorized,
    lecturerOrAdmin,
    blogValidation.createPost,
    blogController.createPost,
  );

Router.route("/blogPost/:id")
  .get(authMiddleware.optionalAuthorized, blogController.getPostDetail)
  .put(
    authMiddleware.isAuthorized,
    lecturerOrAdmin,
    blogValidation.updatePost,
    blogController.updatePost,
  )
  .delete(
    authMiddleware.isAuthorized,
    lecturerOrAdmin,
    blogValidation.deletePost,
    blogController.deletePost,
  );

Router.route("/admin/posts").get(
  authMiddleware.isAuthorized,
  adminOnly,
  blogController.getAdminPosts,
);

Router.route("/lecturer/posts").get(
  authMiddleware.isAuthorized,
  lecturerOrAdmin,
  blogValidation.getAllPosts,
  blogController.getLecturerPosts,
);

Router.route("/admin/posts/:id").get(
  authMiddleware.isAuthorized,
  adminOnly,
  blogController.getAdminPostDetail,
);

Router.route("/lecturer/posts/:id").get(
  authMiddleware.isAuthorized,
  lecturerOrAdmin,
  blogController.getLecturerPostDetail,
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

Router.route("/admin/posts/:id/status").patch(
  authMiddleware.isAuthorized,
  adminOnly,
  blogValidation.updatePostStatus,
  blogController.updatePostStatus,
);

Router.route("/thumbnail").post(
  authMiddleware.isAuthorized,
  multerUploadMiddleware.uploadImage.single("images"),
  blogController.uploadBlogThumbnail,
);

// BLOG COMMENT ROUTE
Router.route("/blogComments")
  .get(blogValidation.getCommentsByBlogId, blogController.getCommentsByBlogId)
  .post(
    authMiddleware.isAuthorized,
    blogValidation.createComment,
    blogController.createComment,
  );

Router.route("/blogPost/:id/comment-bans")
  .get(
    authMiddleware.isAuthorized,
    lecturerOrAdmin,
    blogValidation.getCommentBans,
    blogController.getBannedCommentUsers,
  )
  .post(
    authMiddleware.isAuthorized,
    lecturerOrAdmin,
    blogValidation.banCommentUser,
    blogController.banCommentUser,
  );

Router.route("/blogPost/:id/comment-bans/:userId").delete(
  authMiddleware.isAuthorized,
  lecturerOrAdmin,
  blogValidation.unbanCommentUser,
  blogController.unbanCommentUser,
);

Router.route("/blogComments/:id")
  .put(
    authMiddleware.isAuthorized,
    blogValidation.updateComment,
    blogController.updateComment,
  )
  .delete(
    authMiddleware.isAuthorized,
    blogValidation.deleteComment,
    blogController.deleteComment,
  );

export const blogRoute = Router;
