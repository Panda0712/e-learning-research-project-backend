import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const create = async (reqBody: { userId: number; blogId: number; content: string }) => {
  const { userId, blogId, content } = reqBody;

  const checkPost = await prisma.blogPost.findUnique({ where: { id: blogId } });
  if (!checkPost) throw new ApiError(StatusCodes.NOT_FOUND, "Blog post not found!");

  const result = await prisma.$transaction(async (tx) => {
    const newComment = await tx.blogComment.create({
      data: { userId, blogId, content },
    });

    await tx.blogPost.update({
      where: { id: blogId },
      data: { totalComments: { increment: 1 } },
    });

    return newComment;
  });

  return result;
};

const deleteComment = async (id: number) => {
  const checkComment = await prisma.blogComment.findUnique({ where: { id } });
  if (!checkComment) throw new ApiError(StatusCodes.NOT_FOUND, "Comment not found!");

  await prisma.$transaction(async (tx) => {
    await tx.blogComment.update({
      where: { id },
      data: { isDestroyed: true },
    });

    await tx.blogPost.update({
      where: { id: checkComment.blogId },
      data: { totalComments: { decrement: 1 } },
    });
  });

  return { message: "Delete comment successfully!" };
};

export const blogCommentService = { create, deleteComment };