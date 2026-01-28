import { blogCommentService } from "@/services/blogCommentService.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Ép kiểu ID sang number
    const userId = Number(req.body.userId);
    const blogId = Number(req.body.blogId);
    const { content } = req.body;

    const result = await blogCommentService.create({ userId, blogId, content });
    res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await blogCommentService.deleteComment(Number(id));
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const blogCommentController = { create, deleteComment };