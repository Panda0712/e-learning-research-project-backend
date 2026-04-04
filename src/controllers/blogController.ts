import { CloudinaryProvider } from "@/providers/CloudinaryProvider.js";
import { blogService } from "@/services/blogService.js";
import { BlogActor } from "@/types/blog.type.js";
import ApiError from "@/utils/ApiError.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from "@/utils/constants.js";

const getActorFromJwt = (req: Request): BlogActor => {
  const decodedUserId = Number(req.jwtDecoded?.id);
  const role = String(req.jwtDecoded?.role || "student").toLowerCase() as BlogActor["role"];

  if (!decodedUserId || Number.isNaN(decodedUserId) || decodedUserId <= 0) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized!");
  }

  return {
    id: decodedUserId,
    role,
  };
};

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
    const { page, itemsPerPage } = req.query;

    const result = await blogService.getAllPosts({
      page: Number(page) || DEFAULT_PAGE,
      itemsPerPage: Number(itemsPerPage) || DEFAULT_ITEMS_PER_PAGE,
    });
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getAdminPosts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, itemsPerPage, status } = req.query;
    const result = await blogService.getAdminPosts({
      page: Number(page) || 1,
      itemsPerPage: Number(itemsPerPage || limit) || 10,
      status: typeof status === "string" ? (status as any) : undefined,
    });
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getLecturerPosts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, itemsPerPage, status } = req.query;
    const actor = getActorFromJwt(req);

    const result = await blogService.getLecturerPosts({
      page: Number(page) || 1,
      itemsPerPage: Number(itemsPerPage || limit) || 10,
      actor,
      status: typeof status === "string" ? (status as any) : undefined,
    });

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
    const actor = req.jwtDecoded?.id
      ? {
          id: Number(req.jwtDecoded.id),
          role: String(req.jwtDecoded?.role || "student").toLowerCase() as BlogActor["role"],
        }
      : undefined;

    const result = await blogService.getPostDetail(Number(id), actor);

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getAdminPostDetail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const result = await blogService.getAdminPostDetail(Number(id));

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getLecturerPostDetail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const actor = getActorFromJwt(req);

    const result = await blogService.getPostDetail(Number(id), actor);

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actor = getActorFromJwt(req);
    const authorId = actor.id;

    const result = await blogService.createPost({ ...req.body, authorId }, actor);
    res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const actor = getActorFromJwt(req);

    const result = await blogService.updatePost(Number(id), req.body, actor);

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const updatePostStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const actor = getActorFromJwt(req);

    const result = await blogService.updatePostStatus(Number(id), req.body, actor);

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const actor = getActorFromJwt(req);

    const result = await blogService.deletePost(Number(id), actor);

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

const getCommentsByBlogId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const blogId = Number(req.query.blogId);
    const result = await blogService.getCommentsByBlogId(blogId);
    res.status(StatusCodes.OK).json(result);
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

const banCommentUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const actor = getActorFromJwt(req);
    const blogId = Number(req.params.id);
    const result = await blogService.banCommentUser(blogId, req.body, actor);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const unbanCommentUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const actor = getActorFromJwt(req);
    const blogId = Number(req.params.id);
    const userId = Number(req.params.userId);

    const result = await blogService.unbanCommentUser(blogId, userId, actor);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getBannedCommentUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const actor = getActorFromJwt(req);
    const blogId = Number(req.params.id);

    const result = await blogService.getBannedCommentUsers(blogId, actor);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const uploadBlogThumbnail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const file = req.file as Express.Multer.File;

    const uploadedThumbnail = await CloudinaryProvider.uploadImage(file.buffer);

    res.status(StatusCodes.OK).json(uploadedThumbnail);
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
  getAdminPosts,
  getLecturerPosts,
  getPostDetail,
  getAdminPostDetail,
  getLecturerPostDetail,
  updatePostStatus,
  uploadBlogThumbnail,

  createComment,
  getCommentsByBlogId,
  updateComment,
  deleteComment,
  banCommentUser,
  unbanCommentUser,
  getBannedCommentUsers,
};
