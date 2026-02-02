import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { blogService } from "@/services/blogService.js";
import { blogValidation } from "@/validations/blogValidation.js";
import ApiError from "@/utils/ApiError.js";

const validateData = (schema: any, data: any) => {
  const { error } = schema.validate(data, { abortEarly: false });
  if (error) {
    const errorMessage = error.details.map((detail: any) => detail.message).join(", ");
    throw new ApiError(StatusCodes.BAD_REQUEST, errorMessage);
  }
};

// --- CATEGORY CONTROLLER ---
const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    validateData(blogValidation.createCategory, req.body);
    const result = await blogService.createCategory(req.body);
    res.status(StatusCodes.CREATED).json(result);
  } catch (error) { next(error); }
};

const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await blogService.getAllCategories();
    res.status(StatusCodes.OK).json(result);
  } catch (error) { next(error); }
};

const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    validateData(blogValidation.updateCategory, req.body);
    const result = await blogService.updateCategory(Number(id), req.body);
    res.status(StatusCodes.OK).json(result);
  } catch (error) { next(error); }
};

const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await blogService.deleteCategory(Number(id));
    res.status(StatusCodes.OK).json({ message: "Xóa danh mục thành công" });
  } catch (error) { next(error); }
};

// --- POST & COMMENT CONTROLLERS (Giữ nguyên) ---
const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    validateData(blogValidation.createPost, req.body);
    const result = await blogService.createPost(userId, req.body);
    res.status(StatusCodes.CREATED).json(result);
  } catch (error) { next(error); }
};

const getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await blogService.getAllPosts(req.query);
    res.status(StatusCodes.OK).json(result);
  } catch (error) { next(error); }
};

const getPostDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await blogService.getPostDetail(Number(id));
    res.status(StatusCodes.OK).json(result);
  } catch (error) { next(error); }
};

const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    validateData(blogValidation.updatePost, req.body);
    const result = await blogService.updatePost(Number(id), userId, req.body);
    res.status(StatusCodes.OK).json(result);
  } catch (error) { next(error); }
};

const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    await blogService.deletePost(Number(id), userId);
    res.status(StatusCodes.OK).json({ message: "Xóa bài viết thành công" });
  } catch (error) { next(error); }
};

const createComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    validateData(blogValidation.createComment, req.body);
    const result = await blogService.createComment(userId, req.body);
    res.status(StatusCodes.CREATED).json(result);
  } catch (error) { next(error); }
};

const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.userId;
        const { id } = req.params;
        await blogService.deleteComment(Number(id), userId);
        res.status(StatusCodes.OK).json({ message: "Xóa bình luận thành công" });
    } catch (error) { next(error); }
}

export const blogController = {
  createCategory, getAllCategories, updateCategory, deleteCategory,
  createPost, getAllPosts, getPostDetail, updatePost, deletePost,
  createComment, deleteComment
};
