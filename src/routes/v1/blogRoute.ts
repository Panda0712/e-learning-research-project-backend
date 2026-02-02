import express from "express";
import { blogController } from "@/controllers/blogController.js";
import { verifyToken } from "@/middlewares/authMiddleware.js";

const Router = express.Router();

// ==========================
// 1. ROUTES CHO CATEGORY
// ==========================
// Public
Router.get("/categories", blogController.getAllCategories);

// Private
Router.post("/categories", verifyToken, blogController.createCategory);
Router.put("/categories/:id", verifyToken, blogController.updateCategory);
Router.delete("/categories/:id", verifyToken, blogController.deleteCategory);


// ==========================
// 2. ROUTES CHO COMMENT
// ==========================
Router.post("/comments", verifyToken, blogController.createComment);
Router.delete("/comments/:id", verifyToken, blogController.deleteComment);


// ==========================
// 3. ROUTES CHO POST
// ==========================
// Public
Router.get("/", blogController.getAllPosts);
Router.get("/:id", blogController.getPostDetail);

// Private
Router.post("/", verifyToken, blogController.createPost);
Router.put("/:id", verifyToken, blogController.updatePost);
Router.delete("/:id", verifyToken, blogController.deletePost);

export const blogRoute = Router;
