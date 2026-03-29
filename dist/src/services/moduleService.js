import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { courseRepo } from "./repo/courseRepo.js";
const createModule = async (data) => {
    try {
        // check course existence
        const course = await prisma.course.findUnique({
            where: { id: data.courseId, isDestroyed: false },
        });
        if (!course)
            throw new ApiError(StatusCodes.NOT_FOUND, "Course not found!");
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
    }
    catch (error) {
        throw error;
    }
};
const updateModule = async (id, updateData) => {
    try {
        // check module existence
        const existingModule = await prisma.module.findUnique({
            where: { id, isDestroyed: false },
        });
        if (!existingModule)
            throw new ApiError(StatusCodes.NOT_FOUND, "Module not found!");
        // update module
        const updatedModule = await prisma.module.update({
            where: { id },
            data: updateData,
        });
        return updatedModule;
    }
    catch (error) {
        throw error;
    }
};
const deleteModule = async (id) => {
    try {
        // check module existence
        const existingModule = await prisma.module.findUnique({
            where: { id, isDestroyed: false },
        });
        if (!existingModule)
            throw new ApiError(StatusCodes.NOT_FOUND, "Module not found!");
        // delete module
        return await prisma.module.update({
            where: { id },
            data: { isDestroyed: true },
        });
    }
    catch (error) {
        throw error;
    }
};
const getModuleById = async (id) => {
    try {
        // check module existence
        const existingModule = await prisma.module.findUnique({
            where: { id, isDestroyed: false },
        });
        if (!existingModule)
            throw new ApiError(StatusCodes.NOT_FOUND, "Module not found!");
        return existingModule;
    }
    catch (error) {
        throw error;
    }
};
const getAllModulesByCourseId = async (courseId, actorId) => {
    try {
        // check course existence
        const course = await prisma.course.findUnique({
            where: { id: courseId, isDestroyed: false },
            select: { id: true },
        });
        if (!course)
            throw new ApiError(StatusCodes.NOT_FOUND, "Course not found!");
        if (actorId)
            await courseRepo.ensureStudentCanLearnCourse(actorId, courseId);
        // get modules
        const modules = await prisma.module.findMany({
            where: { courseId, isDestroyed: false },
            orderBy: { id: "asc" },
        });
        return modules;
    }
    catch (error) {
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
//# sourceMappingURL=moduleService.js.map