import { prisma } from "@/lib/prisma.js";
import { CreateLesson, UpdateLesson } from "@/types/lesson.type.js";
import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { resourceService } from "./resourceService.js";

const createLesson = async (data: CreateLesson) => {
  try {
    // check module existence
    const module = await prisma.module.findUnique({
      where: { id: data.moduleId, isDestroyed: false },
    });
    if (!module) throw new ApiError(StatusCodes.NOT_FOUND, "Module not found!");

    // check lesson existence
    const lesson = await prisma.lesson.findFirst({
      where: { title: data.title, moduleId: module.id, isDestroyed: false },
    });
    if (lesson)
      throw new ApiError(StatusCodes.CONFLICT, "Lesson already exists!");

    // create lesson
    return await prisma.$transaction(async (tx) => {
      let lessonFile;
      if (data.resource) {
        lessonFile = await resourceService.createResourceWithTransaction(
          {
            publicId: data.resource.publicId,
            fileSize: data.resource.fileSize ?? null,
            fileType: data.resource.fileType ?? null,
            fileUrl: data.resource.fileUrl,
          },
          tx,
        );
      }

      const createdVideoResource =
        await resourceService.createResourceWithTransaction(
          {
            publicId: data.video.publicId,
            fileSize: data.video.fileSize ?? null,
            fileType: data.video.fileType ?? null,
            fileUrl: data.video.fileUrl,
          },
          tx,
        );

      const newLesson = await tx.lesson.create({
        data: {
          lessonFileId: lessonFile?.id || null,
          lessonVideoId: createdVideoResource.id,
          moduleId: module.id,
          title: data.title,
          description: data.description,
          note: data.note,
          duration: data.duration,
        },
      });

      return newLesson;
    });
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

    // update lesson file
    if (updateData?.resource || updateData?.video) {
      return await prisma.$transaction(async (tx) => {
        let lessonFile;
        if (updateData.resource) {
          lessonFile = await resourceService.createResourceWithTransaction(
            {
              publicId: updateData.resource.publicId,
              fileSize: updateData.resource.fileSize ?? null,
              fileType: updateData.resource.fileType ?? null,
              fileUrl: updateData.resource.fileUrl,
            },
            tx,
          );
        }

        let lessonVideo;
        if (updateData.video) {
          lessonVideo = await resourceService.createResourceWithTransaction(
            {
              publicId: updateData.video.publicId,
              fileSize: updateData.video.fileSize ?? null,
              fileType: updateData.video.fileType ?? null,
              fileUrl: updateData.video.fileUrl,
            },
            tx,
          );
        }

        const updatedLesson = await tx.lesson.update({
          where: { id },
          data: {
            lessonFileId: lessonFile?.id || existingLesson.lessonFileId,
            lessonVideoId: lessonVideo?.id || existingLesson.lessonVideoId,
            title: updateData.title ?? existingLesson.title,
            description: updateData.description ?? existingLesson.description,
            note: updateData.note ?? existingLesson.note,
            duration: updateData.duration ?? existingLesson.duration,
          },
        });

        return updatedLesson;
      });
    }

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
      where: { lessonVideoId: resourceId, isDestroyed: false },
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
