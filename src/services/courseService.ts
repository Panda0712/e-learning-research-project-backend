import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../lib/prisma.js";
import { CreateCourse, UpdateCourse } from "@/types/course.type.js";
import {
  COURSE_STATUS,
  DEFAULT_ITEMS_PER_PAGE,
  DEFAULT_PAGE,
} from "@/utils/constants.js";

const createCourseCategory = async (data: { name: string; slug: string }) => {
  try {
    // check category existence
    const category = await prisma.courseCategory.findUnique({
      where: {
        slug: data.slug,
        isDestroyed: false,
      },
    });

    if (category) {
      throw new ApiError(StatusCodes.CONFLICT, "Category already exists!");
    }

    // create category
    const createdCategory = await prisma.courseCategory.create({
      data: {
        name: data.name,
        slug: data.slug,
      },
    });

    return createdCategory;
  } catch (error: any) {
    throw new Error(error);
  }
};

const createCourseFaq = async (data: {
  courseId: number;
  question: string;
  answer: string;
}) => {
  try {
    // check faq existence
    const faq = await prisma.courseFAQ.findFirst({
      where: {
        courseId: data.courseId,
        question: data.question,
        isDestroyed: false,
      },
    });

    if (faq) {
      throw new ApiError(StatusCodes.CONFLICT, "FAQ already exists!");
    }

    // create course faq
    const createdCourseFaq = await prisma.courseFAQ.create({
      data: {
        courseId: Number(data.courseId),
        question: data.question,
        answer: data.answer,
      },
    });

    return createdCourseFaq;
  } catch (error: any) {
    throw new Error(error);
  }
};

const getAllCourseCategories = async () => {
  return await prisma.courseCategory.findMany({
    where: { isDestroyed: false },
  });
};

const getFaqsByCourseId = async (courseId: number) => {
  try {
    const faqsList = await prisma.courseFAQ.findMany({
      where: {
        courseId: courseId,
        isDestroyed: false,
      },
      include: {
        course: true,
      },
    });

    return faqsList;
  } catch (error: any) {
    throw new Error(error);
  }
};

const getCourseFaqById = async (id: number) => {
  try {
    const faq = await prisma.courseFAQ.findUnique({
      where: {
        id: id,
        isDestroyed: false,
      },
      include: {
        course: true,
      },
    });

    return faq;
  } catch (error: any) {
    throw new Error(error);
  }
};

const createCourse = async (data: CreateCourse) => {
  try {
    // check course existence
    const course = await prisma.course.findFirst({
      where: { name: data.name, isDestroyed: false },
    });
    if (course) {
      throw new ApiError(StatusCodes.CONFLICT, "Course already exists!");
    }

    // create course
    const createdCourse = await prisma.course.create({
      data: {
        ...data,
        totalStudents: 0,
        totalLessons: 0,
        totalQuizzes: 0,
      },
    });

    return createdCourse;
  } catch (error: any) {
    throw new Error(error);
  }
};

const updateCourse = async (id: number, updateData: UpdateCourse) => {
  try {
    // check course existence
    const course = await prisma.course.findUnique({
      where: { id, isDestroyed: false },
    });
    if (!course) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Course not found!");
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: updateData,
    });

    return updatedCourse;
  } catch (error: any) {
    throw new Error(error);
  }
};

const deleteCourse = async (id: number) => {
  try {
    // check course existence
    const course = await prisma.course.findUnique({
      where: { id, isDestroyed: false },
    });
    if (!course) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Course not found!");
    }

    return await prisma.course.update({
      where: { id },
      data: { isDestroyed: true },
    });
  } catch (error: any) {
    throw new Error(error);
  }
};

const approveCourse = async (id: number) => {
  try {
    // check course existence
    const course = await prisma.course.findUnique({
      where: { id, isDestroyed: false },
    });
    if (!course) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Course not found!");
    }

    // check course status
    if (
      course.status !== COURSE_STATUS.PENDING &&
      course.status !== COURSE_STATUS.DRAFT
    ) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Course is not pending or draft!",
      );
    }
    if (course.status === COURSE_STATUS.PUBLISHED) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Course is already published!",
      );
    }

    // update course status
    const approvedCourse = await prisma.course.update({
      where: { id },
      data: { status: COURSE_STATUS.PUBLISHED },
    });

    return approvedCourse;
  } catch (error: any) {
    throw new Error(error);
  }
};

const rejectCourse = async (id: number) => {
  try {
    // check course existence
    const course = await prisma.course.findUnique({
      where: { id, isDestroyed: false },
    });
    if (!course) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Course not found!");
    }

    // check course status
    if (
      course.status !== COURSE_STATUS.PENDING &&
      course.status !== COURSE_STATUS.DRAFT
    ) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Course is not pending or draft!",
      );
    }
    if (course.status === COURSE_STATUS.REJECTED) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Course is already rejected!",
      );
    }

    // update course status
    const rejectedCourse = await prisma.course.update({
      where: { id },
      data: { status: COURSE_STATUS.REJECTED },
    });

    return rejectedCourse;
  } catch (error: any) {
    throw new Error(error);
  }
};

const getCourseById = async (id: number) => {
  try {
    // check course existence
    const course = await prisma.course.findUnique({
      where: { id, isDestroyed: false },
    });
    if (!course) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Course not found!");
    }

    return course;
  } catch (error: any) {
    throw new Error(error);
  }
};

const getAllCoursesByLecturerId = async (lecturerId: number) => {
  try {
    // check lecturer existence
    const lecturer = await prisma.user.findUnique({
      where: { id: lecturerId, isDestroyed: false },
    });
    if (!lecturer) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Lecturer not found!");
    }

    // get courses
    const courses = await prisma.course.findMany({
      where: { lecturerId, isDestroyed: false },
    });

    return courses;
  } catch (error: any) {
    throw new Error(error);
  }
};

const getAllCoursesByCategoryId = async (categoryId: number) => {
  try {
    // check category existence
    const category = await prisma.courseCategory.findUnique({
      where: { id: categoryId, isDestroyed: false },
    });
    if (!category) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Category not found!");
    }

    // get courses
    const courses = await prisma.course.findMany({
      where: { categoryId, isDestroyed: false },
    });

    return courses;
  } catch (error: any) {
    throw new Error(error);
  }
};

const getListCourses = async (
  page: number,
  itemsPerPage: number,
  q: string,
) => {
  try {
    const currentPage = page ? Number(page) : DEFAULT_PAGE;
    const perPage = itemsPerPage
      ? Number(itemsPerPage)
      : DEFAULT_ITEMS_PER_PAGE;

    const skip = (currentPage - 1) * perPage;

    const where = {
      isDestroyed: false,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { lecturerName: { contains: q, mode: "insensitive" } },
              { overview: { contains: q, mode: "insensitive" } },
              { level: { contains: q, mode: "insensitive" } },
              { status: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [courses, totalCourses] = await Promise.all([
      prisma.course.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take: perPage,
      }),
      prisma.course.count({ where }),
    ]);

    return { courses, totalCourses };
  } catch (error: any) {
    throw new Error(error);
  }
};

export const courseService = {
  createCourseCategory,
  getAllCourseCategories,

  createCourseFaq,
  getFaqsByCourseId,
  getCourseFaqById,

  createCourse,
  updateCourse,
  deleteCourse,
  approveCourse,
  rejectCourse,
  getListCourses,
  getCourseById,
  getAllCoursesByLecturerId,
  getAllCoursesByCategoryId,
};
