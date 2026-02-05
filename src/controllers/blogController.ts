import { blogService } from "@/services/blogService.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

// BLOG CATEGORY CONTROLLER
const createBlogCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await blogService.createBlogCategory(req.body);
    res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

const getAllBlogCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await blogService.getAllBlogCategories();
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const updateBlogCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const result = await blogService.updateBlogCategory(Number(id), req.body);

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteBlogCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const result = await blogService.deleteBlogCategory(Number(id));
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

// BLOG POST CONTROLLER
const getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await blogService.getAllPosts();
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getPostDetail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const result = await blogService.getPostDetail(Number(id));

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorId = Number(req.jwtDecoded.id);
    const result = await blogService.createPost({ ...req.body, authorId });
    res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await blogService.updatePost(Number(id), req.body);

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await blogService.deletePost(Number(id));

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

// BLOG COMMENT CONTROLLER
const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = Number(req.jwtDecoded.id);
    const result = await blogService.createComment({ ...req.body, userId });
    res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

const updateComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const result = await blogService.updateComment(Number(id), req.body);

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const result = await blogService.deleteComment(Number(id));

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const blogController = {
  createBlogCategory,
  getAllBlogCategories,
  updateBlogCategory,
  deleteBlogCategory,

  createPost,
  updatePost,
  deletePost,
  getAllPosts,
  getPostDetail,

  createComment,
  updateComment,
  deleteComment,
};
