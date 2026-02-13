import { CloudinaryProvider } from "@/providers/CloudinaryProvider.js";
import { lessonService } from "@/services/lessonService.js";
import { MIN_VIDEO_CHECK_SIZE } from "@/utils/validators.js";
import { NextFunction, Request, Response } from "express";
import fs from "fs/promises";
import { StatusCodes } from "http-status-codes";

const createLesson = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const createdLesson = await lessonService.createLesson(req.body);

    res.status(StatusCodes.CREATED).json(createdLesson);
  } catch (error) {
    next(error);
  }
};

const updateLesson = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const updatedLesson = await lessonService.updateLesson(
      Number(id),
      req.body,
    );

    res.status(StatusCodes.OK).json(updatedLesson);
  } catch (error) {
    next(error);
  }
};

const deleteLesson = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    await lessonService.deleteLesson(Number(id));

    res
      .status(StatusCodes.OK)
      .json({ message: "Lesson deleted successfully!" });
  } catch (error) {
    next(error);
  }
};

const getLessonById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const lesson = await lessonService.getLessonById(Number(id));

    res.status(StatusCodes.OK).json(lesson);
  } catch (error) {
    next(error);
  }
};

const getAllLessonsByModuleId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { moduleId } = req.params;

    const lessons = await lessonService.getAllLessonsByModuleId(
      Number(moduleId),
    );

    res.status(StatusCodes.OK).json(lessons);
  } catch (error) {
    next(error);
  }
};

const getLessonByResourceId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { resourceId } = req.params;

    const lesson = await lessonService.getLessonByResourceId(
      Number(resourceId),
    );

    res.status(StatusCodes.OK).json(lesson);
  } catch (error) {
    next(error);
  }
};

const uploadLessonFiles = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const files = req.files as Express.Multer.File[];
    const uploaded = await Promise.all(
      files.map((f) => CloudinaryProvider.uploadDoc(f.buffer)),
    );
    res.status(StatusCodes.OK).json(uploaded);
  } catch (error) {
    next(error);
  }
};

const uploadLessonVideos = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const videos = req.files as Express.Multer.File[];

    const uploaded = await Promise.all(
      videos.map(async (video) => {
        try {
          if (video.size >= MIN_VIDEO_CHECK_SIZE) {
            return await CloudinaryProvider.uploadVideoLarge(video.path);
          }
          return await CloudinaryProvider.uploadVideo(video.buffer);
        } finally {
          if (video.path) await fs.unlink(video.path).catch(() => undefined);
        }
      }),
    );

    res.status(StatusCodes.OK).json(uploaded);
  } catch (error) {
    next(error);
  }
};

export const lessonController = {
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonById,
  getAllLessonsByModuleId,
  getLessonByResourceId,
  uploadLessonFiles,
  uploadLessonVideos,
};
