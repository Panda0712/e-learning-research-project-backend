import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const create = async (reqBody: any) => {
  const { title, content, authorId, categoryId, slug, thumbnail } = reqBody;

  // Kiểm tra xem category có tồn tại không
  if (categoryId) {
    const category = await prisma.blogCategory.findUnique({
      where: { id: categoryId },
    });
    if (!category) throw new ApiError(StatusCodes.NOT_FOUND, "Category not found!");
  }

  const newPost = await prisma.blogPost.create({
    data: {
      title,
      slug,
      content,
      thumbnail,
      authorId,
      categoryId,
    },
  });
  return newPost;
};

const getAll = async () => {
  return await prisma.blogPost.findMany({
    where: { isDestroyed: false },
    include: {
      author: {
        select: { id: true, email: true, firstName: true, lastName: true, avatar: true },
      },
      category: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getById = async (id: number) => {
  const post = await prisma.blogPost.findFirst({
    where: { id, isDestroyed: false },
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, avatar: true },
      },
      category: true,
      comments: { // Lấy luôn comment của bài viết
        where: { isDestroyed: false },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatar: true } }
        },
        orderBy: { createdAt: "desc" }
      }
    },
  });

  if (!post) throw new ApiError(StatusCodes.NOT_FOUND, "Post not found!");
  return post;
};

const update = async (id: number, reqBody: any) => {
  const checkPost = await prisma.blogPost.findUnique({ where: { id } });
  if (!checkPost) throw new ApiError(StatusCodes.NOT_FOUND, "Post not found!");

  const updatedPost = await prisma.blogPost.update({
    where: { id },
    data: reqBody,
  });
  return updatedPost;
};

const deletePost = async (id: number) => {
  const checkPost = await prisma.blogPost.findUnique({ where: { id } });
  if (!checkPost) throw new ApiError(StatusCodes.NOT_FOUND, "Post not found!");

  // Soft delete (Xóa mềm)
  await prisma.blogPost.update({
    where: { id },
    data: { isDestroyed: true },
  });

  return { message: "Delete post successfully!" };
};

export const blogPostService = { create, getAll, getById, update, deletePost };