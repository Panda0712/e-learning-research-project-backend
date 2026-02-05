import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../lib/prisma.js";

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

export const courseService = {
  createCourseCategory,
  createCourseFaq,
  getAllCourseCategories,
  getFaqsByCourseId,
  getCourseFaqById,
};
