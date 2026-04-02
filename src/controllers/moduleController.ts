import { moduleService } from "@/services/moduleService.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const createModule = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const actorId = Number(req.jwtDecoded?.id);
    const createdModule = await moduleService.createModule(req.body, actorId);

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
    const actorId = Number(req.jwtDecoded?.id);

    const updatedModule = await moduleService.updateModule(
      Number(id),
      req.body,
      actorId,
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
    const actorId = Number(req.jwtDecoded?.id);

    await moduleService.deleteModule(Number(id), actorId);

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
    const actorId = req.jwtDecoded?.id ? Number(req.jwtDecoded.id) : null;

    const modules = await moduleService.getAllModulesByCourseId(
      Number(courseId),
      Number(actorId),
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
