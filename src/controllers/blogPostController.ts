import { blogPostService } from "@/services/blogPostService.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await blogPostService.create(req.body);
    res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await blogPostService.getAll();
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await blogPostService.getById(Number(id));
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await blogPostService.update(Number(id), req.body);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await blogPostService.deletePost(Number(id));
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const blogPostController = { create, getAll, getById, update, deletePost };