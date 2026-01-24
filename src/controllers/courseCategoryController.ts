import { Request, Response, NextFunction } from 'express';
import { courseCategoryService } from '../services/courseCategoryService.js';

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newCategory = await courseCategoryService.createCategory(req.body);
    res.status(201).json({
      message: 'Create category success!',
      data: newCategory,
    });
  } catch (error) {
    next(error);
  }
};

const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await courseCategoryService.getAllCategories();
    res.status(200).json({
      message: 'Get all categories success!',
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const courseCategoryController = {
  create,
  getAll,
};