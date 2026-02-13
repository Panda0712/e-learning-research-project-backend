import { resourceService } from "@/services/resourceService.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const createResource = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const createdResource = await resourceService.createResource(req.body);

    res.status(StatusCodes.CREATED).json(createdResource);
  } catch (error) {
    next(error);
  }
};

const getResourceById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const resource = await resourceService.getResourceById(Number(id));

    res.status(StatusCodes.OK).json(resource);
  } catch (error) {
    next(error);
  }
};

const getResourceByPublicId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { publicId } = req.params;

    const resource = await resourceService.getResourceByPublicId(
      publicId as string,
    );

    res.status(StatusCodes.OK).json(resource);
  } catch (error) {
    next(error);
  }
};

const getAllResourcesByFileType = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fileType } = req.params;

    const resources = await resourceService.getAllResourcesByFileType(
      fileType as string,
    );

    res.status(StatusCodes.OK).json(resources);
  } catch (error) {
    next(error);
  }
};

const deleteResource = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    await resourceService.deleteResource(Number(id));

    res
      .status(StatusCodes.OK)
      .json({ message: "Resource deleted successfully!" });
  } catch (error) {
    next(error);
  }
};

const deleteResourceByPublicId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { publicId } = req.params;

    await resourceService.deleteResourceByPublicId(publicId as string);

    res
      .status(StatusCodes.OK)
      .json({ message: "Resource deleted successfully!" });
  } catch (error) {
    next(error);
  }
};

export const resourceController = {
  createResource,
  getResourceById,
  getResourceByPublicId,
  getAllResourcesByFileType,
  deleteResource,
  deleteResourceByPublicId,
};
