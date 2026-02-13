import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/lib/prisma.js";
import { CreateResource } from "@/types/resource.type.js";
import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const createResource = async (data: CreateResource) => {
  try {
    // check resource existence
    const resource = await prisma.resource.findFirst({
      where: { publicId: data.publicId, isDestroyed: false },
    });
    if (resource)
      throw new ApiError(StatusCodes.CONFLICT, "Resource already exists!");

    // create resource
    const createdResource = await prisma.resource.create({
      data: {
        publicId: data.publicId,
        fileSize: data.fileSize ?? null,
        fileType: data.fileType ?? null,
        fileUrl: data.fileUrl,
      },
    });

    return createdResource;
  } catch (error: any) {
    throw new Error(error);
  }
};

const createResourceWithTransaction = async (
  data: CreateResource,
  tx: Prisma.TransactionClient,
) => {
  try {
    // check resource existence in transaction
    const existing = await tx.resource.findFirst({
      where: {
        publicId: data.publicId,
        isDestroyed: false,
      },
    });

    if (existing) {
      throw new ApiError(StatusCodes.CONFLICT, "Resource already exists!");
    }

    const newResource = await tx.resource.create({
      data: {
        publicId: data.publicId,
        fileSize: data.fileSize ?? null,
        fileType: data.fileType ?? null,
        fileUrl: data.fileUrl,
      },
    });

    return newResource;
  } catch (error: any) {
    throw new Error(error);
  }
};

const getResourceById = async (id: number) => {
  try {
    // check resource existence
    const resource = await prisma.resource.findUnique({
      where: { id, isDestroyed: false },
    });
    if (!resource)
      throw new ApiError(StatusCodes.NOT_FOUND, "Resource not found!");

    return resource;
  } catch (error: any) {
    throw new Error(error);
  }
};

const getResourceByPublicId = async (publicId: string) => {
  try {
    // check resource existence
    const resource = await prisma.resource.findUnique({
      where: { publicId, isDestroyed: false },
    });
    if (!resource)
      throw new ApiError(StatusCodes.NOT_FOUND, "Resource not found!");

    return resource;
  } catch (error: any) {
    throw new Error(error);
  }
};

const getAllResourcesByFileType = async (fileType: string) => {
  try {
    // check resource existence
    const resources = await prisma.resource.findMany({
      where: { fileType, isDestroyed: false },
    });
    if (!resources || resources.length === 0)
      throw new ApiError(StatusCodes.NOT_FOUND, "Resource not found!");

    return resources;
  } catch (error: any) {
    throw new Error(error);
  }
};

const deleteResource = async (id: number) => {
  try {
    // check resource existence
    const resource = await prisma.resource.findUnique({
      where: { id, isDestroyed: false },
    });
    if (!resource)
      throw new ApiError(StatusCodes.NOT_FOUND, "Resource not found!");

    // delete resource
    return await prisma.resource.update({
      where: { id },
      data: { isDestroyed: true },
    });
  } catch (error: any) {
    throw new Error(error);
  }
};

const deleteResourceByPublicId = async (publicId: string) => {
  try {
    // check resource existence
    const resource = await prisma.resource.findUnique({
      where: { publicId, isDestroyed: false },
    });
    if (!resource)
      throw new ApiError(StatusCodes.NOT_FOUND, "Resource not found!");

    // delete resource
    return await prisma.resource.update({
      where: { publicId },
      data: { isDestroyed: true },
    });
  } catch (error: any) {
    throw new Error(error);
  }
};

export const resourceService = {
  createResource,
  createResourceWithTransaction,
  getResourceById,
  getResourceByPublicId,
  getAllResourcesByFileType,
  deleteResource,
  deleteResourceByPublicId,
};
