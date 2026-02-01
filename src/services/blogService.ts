import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const createBlogCategory = async (reqBody: { name: string; slug: string }) => {
  try {
    // check slug existence
    const checkSlug = await prisma.blogCategory.findUnique({
      where: { slug: reqBody.slug, isDestroyed: false },
    });

    if (checkSlug) {
      throw new ApiError(StatusCodes.CONFLICT, "Category slug already exists!");
    }

    // create new category
    const newCategory = await prisma.blogCategory.create({
      data: {
        name: reqBody.name,
        slug: reqBody.slug,
      },
    });

    return newCategory;
  } catch (error: any) {
    throw new Error(error);
  }
};

const getAllBlogCategories = async () => {
  return await prisma.blogCategory.findMany({
    where: { isDestroyed: false },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });
};

const deleteBlogCategory = async (id: number) => {
  try {
    // check category existence
    const checkCategory = await prisma.blogCategory.findUnique({
      where: { id, isDestroyed: false },
    });

    if (!checkCategory) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Category not found!");
    }

    // delete category
    await prisma.blogCategory.delete({
      where: { id },
    });

    return { message: "Delete category successfully!" };
  } catch (error: any) {
    throw new Error(error);
  }
};

export const blogService = {
  createBlogCategory,
  getAllBlogCategories,
  deleteBlogCategory,
};
