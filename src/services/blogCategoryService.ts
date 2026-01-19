import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const create = async (reqBody: { name: string; slug: string }) => {
  // Check slug
  const checkSlug = await prisma.blogCategory.findUnique({
    where: { slug: reqBody.slug },
  });

  if (checkSlug) {
    throw new ApiError(StatusCodes.CONFLICT, "Category slug already exists!");
  }

  const newCategory = await prisma.blogCategory.create({
    data: {
      name: reqBody.name, // Dùng 'name' theo schema của cậu
      slug: reqBody.slug,
    },
  });

  return newCategory;
};

const getAll = async () => {
  return await prisma.blogCategory.findMany({
    where: { isDestroyed: false }, // Chỉ lấy danh mục chưa bị xóa mềm
    include: {
      _count: {
        select: { posts: true }, // Đếm số bài viết (field là 'posts' trong schema của cậu)
      },
    },
  });
};

const deleteCategory = async (id: number) => { // ID nhận vào là number
  const checkCategory = await prisma.blogCategory.findUnique({
    where: { id },
  });

  if (!checkCategory) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Category not found!");
  }

  // Xóa mềm (Soft delete) hoặc xóa cứng tùy cậu. Ở đây tớ dùng xóa cứng theo mẫu cũ
  await prisma.blogCategory.delete({
    where: { id },
  });

  return { message: "Delete category successfully!" };
};

export const blogCategoryService = {
  create,
  getAll,
  deleteCategory,
};