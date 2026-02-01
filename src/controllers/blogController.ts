import { blogService } from "@/services/blogService.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

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

export const blogController = {
  createBlogCategory,
  getAllBlogCategories,
  deleteBlogCategory,
};
