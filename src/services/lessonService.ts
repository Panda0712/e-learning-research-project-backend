import { prisma } from "@/lib/prisma.js";
import { CreateLesson, UpdateLesson } from "@/types/lesson.type.js";
import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const createLesson = async (data: CreateLesson) => {
  try {
    // check module existence
    const module = await prisma.module.findUnique({
      where: { id: data.moduleId, isDestroyed: false },
    });
    if (!module) throw new ApiError(StatusCodes.NOT_FOUND, "Module not found!");

    // check resource existence
    const resource = await prisma.resource.findUnique({
      where: { id: data.resourceId, isDestroyed: false },
    });
    if (!resource)
      throw new ApiError(StatusCodes.NOT_FOUND, "Resource not found!");

    // check lesson existence
    const lesson = await prisma.lesson.findFirst({
      where: { title: data.title, moduleId: module.id, isDestroyed: false },
    });
    if (lesson)
      throw new ApiError(StatusCodes.CONFLICT, "Lesson already exists!");

    // create lesson
    const createdLesson = await prisma.lesson.create({
      data: {
        resourceId: resource.id,
        moduleId: module.id,
        title: data.title,
        description: data.description,
        note: data.note,
        videoUrl: data.videoUrl,
        duration: data.duration,
      },
    });

    return createdLesson;
  } catch (error: any) {
    throw new Error(error);
  }
};

const updateLesson = async (id: number, updateData: UpdateLesson) => {
  try {
    // check lesson existence
    const existingLesson = await prisma.lesson.findUnique({
      where: { id, isDestroyed: false },
    });
    if (!existingLesson)
      throw new ApiError(StatusCodes.NOT_FOUND, "Lesson not found!");

    // update lesson
    const updatedLesson = await prisma.lesson.update({
      where: { id },
      data: updateData,
    });

    return updatedLesson;
  } catch (error: any) {
    throw new Error(error);
  }
};

const deleteLesson = async (id: number) => {
  try {
    // check lesson existence
    const existingLesson = await prisma.lesson.findUnique({
      where: { id, isDestroyed: false },
    });
    if (!existingLesson)
      throw new ApiError(StatusCodes.NOT_FOUND, "Lesson not found!");

    // delete lesson
    return await prisma.lesson.update({
      where: { id },
      data: { isDestroyed: true },
    });
  } catch (error: any) {
    throw new Error(error);
  }
};

const getLessonById = async (id: number) => {
  try {
    // check lesson existence
    const existingLesson = await prisma.lesson.findUnique({
      where: { id, isDestroyed: false },
    });
    if (!existingLesson)
      throw new ApiError(StatusCodes.NOT_FOUND, "Lesson not found!");

    return existingLesson;
  } catch (error: any) {
    throw new Error(error);
  }
};

const getAllLessonsByModuleId = async (moduleId: number) => {
  try {
    // check module existence
    const module = await prisma.module.findUnique({
      where: { id: moduleId, isDestroyed: false },
    });
    if (!module) throw new ApiError(StatusCodes.NOT_FOUND, "Module not found!");

    // get lessons
    const lessons = await prisma.lesson.findMany({
      where: { moduleId, isDestroyed: false },
    });

    return lessons;
  } catch (error: any) {
    throw new Error(error);
  }
};

const getLessonByResourceId = async (resourceId: number) => {
  try {
    // check resource existence
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    });
    if (!resource)
      throw new ApiError(StatusCodes.NOT_FOUND, "Resource not found!");

    // get lesson
    const lesson = await prisma.lesson.findFirst({
      where: { resourceId, isDestroyed: false },
    });

    return lesson;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const lessonService = {
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonById,
  getAllLessonsByModuleId,
  getLessonByResourceId,
};
