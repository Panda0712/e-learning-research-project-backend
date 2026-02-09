import { moduleService } from "@/services/moduleService.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const createModule = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const createdModule = await moduleService.createModule(req.body);

    res.status(StatusCodes.CREATED).json(createdModule);
  } catch (error) {
    next(error);
  }
};

const updateModule = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const updatedModule = await moduleService.updateModule(
      Number(id),
      req.body,
    );

    res.status(StatusCodes.OK).json(updatedModule);
  } catch (error) {
    next(error);
  }
};

const deleteModule = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    await moduleService.deleteModule(Number(id));

    res
      .status(StatusCodes.OK)
      .json({ message: "Module deleted successfully!" });
  } catch (error) {
    next(error);
  }
};

const getModuleById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const module = await moduleService.getModuleById(Number(id));

    res.status(StatusCodes.OK).json(module);
  } catch (error) {
    next(error);
  }
};

const getAllModulesByCourseId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { courseId } = req.params;

    const modules = await moduleService.getAllModulesByCourseId(
      Number(courseId),
    );

    res.status(StatusCodes.OK).json(modules);
  } catch (error) {
    next(error);
  }
};

export const moduleController = {
  createModule,
  updateModule,
  deleteModule,
  getModuleById,
  getAllModulesByCourseId,
};
