import { CloudinaryProvider } from "@/providers/CloudinaryProvider.js";
import ApiError from "@/utils/ApiError.js";
import { DEFAULT_ITEMS_PER_PAGE } from "@/utils/constants.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { courseService } from "../services/courseService.js";

const createCourseCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const newCategory = await courseService.createCourseCategory(req.body);
    res.status(StatusCodes.CREATED).json(newCategory);
  } catch (error) {
    next(error);
  }
};

const getCourseStudentState = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const courseId = Number(req.params.id);
    const studentId = req.jwtDecoded?.id ? Number(req.jwtDecoded.id) : null;

    const result = await courseService.getCourseStudentState(
      courseId,
      studentId,
    );
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getAllCourseCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await courseService.getAllCourseCategories();
    res.status(StatusCodes.OK).json(categories);
  } catch (error) {
    next(error);
  }
};

const createCourseFaq = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const newFaq = await courseService.createCourseFaq(req.body);
    res.status(StatusCodes.CREATED).json(newFaq);
  } catch (error) {
    next(error);
  }
};

const getCourseFaqByCourseId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { courseId } = req.params;

    const result = await courseService.getFaqsByCourseId(Number(courseId));

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getCourseFaqById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const result = await courseService.getCourseFaqById(Number(id));

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const createCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const lecturerId = Number(req.jwtDecoded?.id);
    if (!Number.isInteger(lecturerId) || lecturerId <= 0) {
      return next(
        new ApiError(
          StatusCodes.UNAUTHORIZED,
          "Unauthorized lecturer identity.",
        ),
      );
    }

    const createdCourse = await courseService.createCourse({
      ...req.body,
      lecturerId,
    });

    res.status(StatusCodes.CREATED).json(createdCourse);
  } catch (error) {
    next(error);
  }
};

const updateCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const courseId = Number(req.params.id);
    const actorId = Number(req.jwtDecoded?.id);

    const updatedCourse = await courseService.updateCourse(
      courseId,
      req.body,
      actorId,
    );

    res.status(StatusCodes.OK).json(updatedCourse);
  } catch (error) {
    next(error);
  }
};

const deleteCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const courseId = Number(req.params.id);
    const actorId = Number(req.jwtDecoded?.id);

    await courseService.deleteCourse(courseId, actorId);

    res.status(StatusCodes.OK).json({ message: "Course deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const approveCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const courseId = Number(req.params.id);
    const actorId = Number(req.jwtDecoded?.id);

    await courseService.approveCourse(courseId, actorId);

    res
      .status(StatusCodes.OK)
      .json({ message: "Course approved successfully" });
  } catch (error) {
    next(error);
  }
};

const rejectCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const courseId = Number(req.params.id);
    const actorId = Number(req.jwtDecoded?.id);

    await courseService.rejectCourse(courseId, actorId);

    res
      .status(StatusCodes.OK)
      .json({ message: "Course rejected successfully" });
  } catch (error) {
    next(error);
  }
};

const getCourseById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const course = await courseService.getCourseById(Number(id));

    res.status(StatusCodes.OK).json(course);
  } catch (error) {
    next(error);
  }
};

const getCourseByIdForLecturer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const courseId = Number(req.params.id);
    const actorId = Number(req.jwtDecoded?.id);

    const course = await courseService.getCourseByIdForLecturer(
      courseId,
      actorId,
    );

    res.status(StatusCodes.OK).json(course);
  } catch (error) {
    next(error);
  }
};

const getListLecturersByStudentId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { studentId } = req.params;
    const { page, itemsPerPage, q } = req.query;

    const result = await courseService.getListLecturersByStudentId(
      Number(studentId),
      Number(page),
      Number(itemsPerPage),
      (q as string) || "",
    );

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getAllCoursesByStudentId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { studentId } = req.params;
    const { page, itemsPerPage, q } = req.query;

    const { courses, totalCourses } =
      await courseService.getAllCoursesByStudentId(
        Number(studentId),
        Number(page),
        Number(itemsPerPage),
        (q as string) || "",
      );

    res.status(StatusCodes.OK).json({ courses, totalCourses });
  } catch (error) {
    next(error);
  }
};

const getAllCoursesByLecturerId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { lecturerId } = req.params;

    const courses = await courseService.getAllCoursesByLecturerId(
      Number(lecturerId),
    );

    res.status(StatusCodes.OK).json(courses);
  } catch (error) {
    next(error);
  }
};

const getAllCoursesByCategoryId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { categoryId } = req.params;

    const courses = await courseService.getAllCoursesByCategoryId(
      Number(categoryId),
    );

    res.status(StatusCodes.OK).json(courses);
  } catch (error) {
    next(error);
  }
};

const getListCourses = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, itemsPerPage, q, categoryId, level, price } = req.query;

    const results = await courseService.getListCourses({
      page: Number(page),
      itemsPerPage: Number(itemsPerPage) || DEFAULT_ITEMS_PER_PAGE,
      q: (q as string) || "",
      categoryId: Number(categoryId),
      level: level as string,
      price: price as string,
    });

    res.status(StatusCodes.OK).json({
      courses: results.courses,
      totalCourses: results.totalCourses,
      pagination: {
        page,
        itemsPerPage,
        total: results.totalCourses,
        totalPages: Math.ceil(
          results.totalCourses /
            (Number(itemsPerPage) ?? DEFAULT_ITEMS_PER_PAGE),
        ),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAdminCourses = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const actorId = Number(req.jwtDecoded?.id);
    const { page, itemsPerPage, q, status } = req.query;

    const results = await courseService.getAdminCourses(
      {
        page: Number(page),
        itemsPerPage: Number(itemsPerPage),
        q: (q as string) || "",
        status: (status as "all" | "active" | "pending" | "rejected") || "all",
      },
      actorId,
    );

    res.status(StatusCodes.OK).json(results);
  } catch (error) {
    next(error);
  }
};

const getAdminCourseById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const actorId = Number(req.jwtDecoded?.id);
    const { id } = req.params;

    const course = await courseService.getAdminCourseById(Number(id), actorId);

    res.status(StatusCodes.OK).json(course);
  } catch (error) {
    next(error);
  }
};

const uploadCourseThumbnail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const file = req.file as Express.Multer.File;

    const uploadedThumbnail = await CloudinaryProvider.uploadImage(file.buffer);

    res.status(StatusCodes.OK).json(uploadedThumbnail);
  } catch (error) {
    next(error);
  }
};

const getMyLecturers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const studentId = Number(req.jwtDecoded.id);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;
    const q = (req.query.q as string) || "";

    const result = await courseService.getListLecturersByStudentId(
      studentId,
      page,
      limit,
      q,
    );

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getMyCourses = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const studentId = Number(req.jwtDecoded.id);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;
    const q = (req.query.q as string) || "";

    const result = await courseService.getAllCoursesByStudentId(
      studentId,
      page,
      limit,
      q,
    );

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getLecturerMyCourses = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const lecturerId = Number(req.jwtDecoded.id);
    const { page, itemsPerPage, status, q, sortBy } = req.query;

    const result = await courseService.getLecturerMyCourses(lecturerId, {
      page: Number(page),
      itemsPerPage: Number(itemsPerPage),
      status: (status as string) || "all",
      q: (q as string) || "",
      sortBy: (sortBy as string) || "createdAt",
    });

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const uploadCourseIntroVideo = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const file = req.file as Express.Multer.File;
    const uploaded = await CloudinaryProvider.uploadVideo(file.buffer);

    res.status(StatusCodes.OK).json(uploaded);
  } catch (error) {
    next(error);
  }
};

export const courseController = {
  createCourseCategory,
  getAllCourseCategories,

  getCourseFaqById,
  createCourseFaq,
  getCourseFaqByCourseId,
  getCourseStudentState,

  createCourse,
  updateCourse,
  deleteCourse,
  approveCourse,
  rejectCourse,
  getCourseById,
  getListCourses,
  getAdminCourses,
  getAdminCourseById,
  getCourseByIdForLecturer,
  getListLecturersByStudentId,
  getAllCoursesByStudentId,
  getAllCoursesByLecturerId,
  getAllCoursesByCategoryId,
  uploadCourseThumbnail,

  getMyLecturers,
  getMyCourses,
  getLecturerMyCourses,
  uploadCourseIntroVideo,
};
