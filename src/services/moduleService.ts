import { prisma } from "@/lib/prisma.js";
import { CreateModule, UpdateModule } from "@/types/module.type.js";
import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { courseRepo } from "./repo/courseRepo.js";

const ensureLecturerOwnsCourse = async (actorId: number, courseId: number) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId, isDestroyed: false },
  });
  if (!course) throw new ApiError(StatusCodes.NOT_FOUND, "Course not found!");
  if (course.lecturerId !== actorId)
    throw new ApiError(StatusCodes.FORBIDDEN, "You are not allowed!");

  return true;
};

const createModule = async (data: CreateModule, actorId: number) => {
  try {
    // check security
    await ensureLecturerOwnsCourse(actorId, data.courseId);

    // check course existence
    const course = await prisma.course.findUnique({
      where: { id: data.courseId, isDestroyed: false },
    });
    if (!course) throw new ApiError(StatusCodes.NOT_FOUND, "Course not found!");

    // check module existence
    const module = await prisma.module.findFirst({
      where: { title: data.title, courseId: course.id, isDestroyed: false },
    });
    if (module)
      throw new ApiError(StatusCodes.CONFLICT, "Module already exists!");

    // create module
    const createdModule = await prisma.module.create({
      data: {
        courseId: course.id,
        title: data.title,
        description: data.description,
        duration: data.duration,
        totalLessons: data.totalLessons,
      },
    });

    return createdModule;
  } catch (error: any) {
    throw error;
  }
};

const updateModule = async (
  id: number,
  updateData: UpdateModule,
  actorId: number,
) => {
  try {
    // check module existence
    const existingModule = await prisma.module.findUnique({
      where: { id, isDestroyed: false },
    });
    if (!existingModule)
      throw new ApiError(StatusCodes.NOT_FOUND, "Module not found!");

    // check security
    await ensureLecturerOwnsCourse(actorId, existingModule.courseId);

    // update module
    const updatedModule = await prisma.module.update({
      where: { id },
      data: updateData,
    });

    return updatedModule;
  } catch (error: any) {
    throw error;
  }
};

const deleteModule = async (id: number, actorId: number) => {
  try {
    // check module existence
    const existingModule = await prisma.module.findUnique({
      where: { id, isDestroyed: false },
    });
    if (!existingModule)
      throw new ApiError(StatusCodes.NOT_FOUND, "Module not found!");

    // check security
    await ensureLecturerOwnsCourse(actorId, existingModule.courseId);

    // delete module
    return await prisma.module.update({
      where: { id },
      data: { isDestroyed: true },
    });
  } catch (error: any) {
    throw error;
  }
};

const getModuleById = async (id: number) => {
  try {
    // check module existence
    const existingModule = await prisma.module.findUnique({
      where: { id, isDestroyed: false },
    });
    if (!existingModule)
      throw new ApiError(StatusCodes.NOT_FOUND, "Module not found!");

    return existingModule;
  } catch (error: any) {
    throw error;
  }
};

const getAllModulesByCourseId = async (courseId: number, actorId?: number) => {
  try {
    // check course existence
    const course = await prisma.course.findUnique({
      where: { id: courseId, isDestroyed: false },
      select: { id: true },
    });
    if (!course) throw new ApiError(StatusCodes.NOT_FOUND, "Course not found!");

    if (actorId)
      await courseRepo.ensureStudentCanLearnCourse(actorId, courseId);

    // get modules
    const modules = await prisma.module.findMany({
      where: { courseId, isDestroyed: false },
      orderBy: { id: "asc" },
    });

    return modules;
  } catch (error: any) {
    throw error;
  }
};

export const moduleService = {
  createModule,
  updateModule,
  deleteModule,
  getModuleById,
  getAllModulesByCourseId,
};
