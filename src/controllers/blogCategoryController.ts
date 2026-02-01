import { blogCategoryService } from "@/services/blogCategoryService.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await blogCategoryService.create(req.body);
    res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await blogCategoryService.getAll();
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    // Quan trọng: Ép kiểu ID sang Number
    const result = await blogCategoryService.deleteCategory(Number(id));
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const blogCategoryController = { create, getAll, deleteCategory };