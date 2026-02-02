import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

// BLOG CATEGORY SERVICE
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

const updateBlogCategory = async (
  id: number,
  reqBody: { name: string; slug: string },
) => {
  try {
    // check category existence
    const checkCategory = await prisma.blogCategory.findUnique({
      where: { id, isDestroyed: false },
    });

    if (!checkCategory) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Category not found!");
    }

    // update category
    const updatedCategory = await prisma.blogCategory.update({
      where: { id },
      data: {
        name: reqBody.name,
        slug: reqBody.slug,
      },
    });

    return updatedCategory;
  } catch (error: any) {
    throw new Error(error);
  }
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

// BLOG POST SERVICE
const createPost = async (reqBody: {
  authorId: number;
  title: string;
  slug: string;
  content: string;
  thumbnail: string;
  categoryId: number;
}) => {
  try {
    // check category existence
    const checkCategory = await prisma.blogCategory.findUnique({
      where: { id: reqBody.categoryId, isDestroyed: false },
    });

    if (!checkCategory) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Category not found!");
    }

    // check slug existence
    const checkSlug = await prisma.blogPost.findFirst({
      where: { slug: reqBody.slug, isDestroyed: false },
    });

    if (checkSlug) {
      throw new ApiError(StatusCodes.CONFLICT, "Post slug already exists!");
    }

    // create new post
    const newPost = await prisma.blogPost.create({
      data: {
        authorId: reqBody.authorId,
        title: reqBody.title,
        slug: reqBody.slug,
        content: reqBody.content,
        thumbnail: reqBody.thumbnail,
        categoryId: reqBody.categoryId,
      },
    });

    return newPost;
  } catch (error: any) {
    throw new Error(error);
  }
};

const getAllPosts = async () => {
  return await prisma.blogPost.findMany({
    where: { isDestroyed: false },
    include: {
      _count: {
        select: { comments: true },
      },
    },
  });
};

const getPostDetail = async (id: number) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { id, isDestroyed: false },
      include: {
        _count: {
          select: { comments: true },
        },
      },
    });

    return post;
  } catch (error: any) {
    throw new Error(error);
  }
};

const updatePost = async (
  id: number,
  reqBody: {
    title: string;
    content: string;
    thumbnail: string;
    categoryId: number;
  },
) => {
  try {
    // check post existence
    const checkPost = await prisma.blogPost.findUnique({
      where: { id, isDestroyed: false },
    });

    if (!checkPost) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Post not found!");
    }

    // update post
    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: {
        title: reqBody.title,
        content: reqBody.content,
        thumbnail: reqBody.thumbnail,
        categoryId: reqBody.categoryId,
      },
    });

    return updatedPost;
  } catch (error: any) {
    throw new Error(error);
  }
};

const deletePost = async (id: number) => {
  try {
    // check post existence
    const checkPost = await prisma.blogPost.findUnique({
      where: { id, isDestroyed: false },
    });

    if (!checkPost) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Post not found!");
    }

    // delete post
    await prisma.blogPost.delete({
      where: { id },
    });

    return { message: "Deleted blog post successfully!" };
  } catch (error: any) {
    throw new Error(error);
  }
};

// BLOG COMMENT SERVICE
const createComment = async (reqBody: {
  content: string;
  userId: number;
  blogId: number;
  parentId?: number;
}) => {
  try {
    // check post existence
    const checkPost = await prisma.blogPost.findUnique({
      where: { id: reqBody.blogId, isDestroyed: false },
    });

    if (!checkPost) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Blog post not found!");
    }

    // create new comment
    const newComment = await prisma.blogComment.create({
      data: {
        content: reqBody.content,
        blogId: reqBody.blogId,
        userId: reqBody.userId,
        // parentId: reqBody?.parentId || null,
      },
    });

    return newComment;
  } catch (error: any) {
    throw new Error(error);
  }
};

const updateComment = async (
  id: number,
  reqBody: { content: string; blogId: number; parentId?: number },
) => {
  try {
    // check comment existence
    const checkComment = await prisma.blogComment.findUnique({
      where: { id, isDestroyed: false },
    });

    if (!checkComment) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Blog comment not found!");
    }

    // update comment
    const updatedComment = await prisma.blogComment.update({
      where: { id },
      data: {
        content: reqBody.content,
        blogId: reqBody.blogId,
        // parentId: reqBody?.parentId || null,
      },
    });

    return updatedComment;
  } catch (error: any) {
    throw new Error(error);
  }
};

const deleteComment = async (id: number) => {
  try {
    // check comment existence
    const checkComment = await prisma.blogComment.findUnique({
      where: { id, isDestroyed: false },
    });

    if (!checkComment) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Comment not found!");
    }

    // delete comment
    await prisma.blogComment.delete({
      where: { id },
    });

    return { message: "Deleted blog comment successfully!" };
  } catch (error: any) {
    throw new Error(error);
  }
};

export const blogService = {
  createBlogCategory,
  updateBlogCategory,
  getAllBlogCategories,
  deleteBlogCategory,

  createPost,
  updatePost,
  deletePost,
  getAllPosts,
  getPostDetail,

  createComment,
  updateComment,
  deleteComment,
};
