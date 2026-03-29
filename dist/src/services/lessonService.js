import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { courseRepo } from "./repo/courseRepo.js";
import { resourceService } from "./resourceService.js";
const createLesson = async (data) => {
    try {
        // check module existence
        const module = await prisma.module.findUnique({
            where: { id: data.moduleId, isDestroyed: false },
        });
        if (!module)
            throw new ApiError(StatusCodes.NOT_FOUND, "Module not found!");
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
                lessonFile = await resourceService.createResourceWithTransaction({
                    publicId: data.resource.publicId,
                    fileSize: data.resource.fileSize ?? null,
                    fileType: data.resource.fileType ?? null,
                    fileUrl: data.resource.fileUrl,
                }, tx);
            }
            const createdVideoResource = await resourceService.createResourceWithTransaction({
                publicId: data.video.publicId,
                fileSize: data.video.fileSize ?? null,
                fileType: data.video.fileType ?? null,
                fileUrl: data.video.fileUrl,
            }, tx);
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
    }
    catch (error) {
        throw error;
    }
};
const updateLesson = async (id, updateData) => {
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
                    lessonFile = await resourceService.createResourceWithTransaction({
                        publicId: updateData.resource.publicId,
                        fileSize: updateData.resource.fileSize ?? null,
                        fileType: updateData.resource.fileType ?? null,
                        fileUrl: updateData.resource.fileUrl,
                    }, tx);
                }
                let lessonVideo;
                if (updateData.video) {
                    lessonVideo = await resourceService.createResourceWithTransaction({
                        publicId: updateData.video.publicId,
                        fileSize: updateData.video.fileSize ?? null,
                        fileType: updateData.video.fileType ?? null,
                        fileUrl: updateData.video.fileUrl,
                    }, tx);
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
    }
    catch (error) {
        throw error;
    }
};
const deleteLesson = async (id) => {
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
    }
    catch (error) {
        throw error;
    }
};
const getLessonById = async (id) => {
    try {
        // check lesson existence
        const existingLesson = await prisma.lesson.findUnique({
            where: { id, isDestroyed: false },
        });
        if (!existingLesson)
            throw new ApiError(StatusCodes.NOT_FOUND, "Lesson not found!");
        return existingLesson;
    }
    catch (error) {
        throw error;
    }
};
const getAllLessonsByModuleId = async (moduleId, actorId) => {
    try {
        // check module existence
        const module = await prisma.module.findUnique({
            where: { id: moduleId, isDestroyed: false },
            select: { id: true, courseId: true },
        });
        if (!module)
            throw new ApiError(StatusCodes.NOT_FOUND, "Module not found!");
        if (actorId)
            await courseRepo.ensureStudentCanLearnCourse(actorId, module.courseId);
        // get lessons
        const lessons = await prisma.lesson.findMany({
            where: { moduleId, isDestroyed: false },
            orderBy: { id: "asc" },
        });
        return lessons;
    }
    catch (error) {
        throw error;
    }
};
const getLessonByResourceId = async (resourceId) => {
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
    }
    catch (error) {
        throw error;
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
//# sourceMappingURL=lessonService.js.map