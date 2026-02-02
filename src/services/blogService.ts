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

// ===========================
// 1. PHẦN CATEGORY
// ===========================
const createCategory = async (data: any) => {
  const existing = await prisma.blogCategory.findFirst({ where: { name: data.name } });
  if (existing) throw new ApiError(StatusCodes.BAD_REQUEST, "Danh mục này đã tồn tại!");

  return await prisma.blogCategory.create({
    data: {
      name: data.name,
      slug: generateSlug(data.name)
    }
  });
};

const getAllCategories = async () => {
  return await prisma.blogCategory.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { posts: true } } 
    },
    where: { isDestroyed: false }
  });
};

const updateCategory = async (id: number, data: any) => {
  const category = await prisma.blogCategory.findUnique({ where: { id } });
  if (!category) throw new ApiError(StatusCodes.NOT_FOUND, "Danh mục không tìm thấy!");

  return await prisma.blogCategory.update({
    where: { id },
    data: {
      ...data,
      ...(data.name && { slug: generateSlug(data.name) }) 
    }
  });
};

const deleteCategory = async (id: number) => {
  // Logic: Nếu danh mục đang có bài viết thì KHÔNG CHO XÓA 
  const category = await prisma.blogCategory.findUnique({ 
    where: { id },
    include: { _count: { select: { posts: true } } }
  });
  
  if (!category) throw new ApiError(StatusCodes.NOT_FOUND, "Danh mục không tìm thấy!");
  
  if (category._count.posts > 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Không thể xóa danh mục đang chứa bài viết!");
  }

  return await prisma.blogCategory.delete({ where: { id } });
};

// ===========================
// 2. PHẦN BLOG POST
// ===========================
const createPost = async (userId: number, data: any) => {
  return await prisma.blogPost.create({
    data: {
      title: data.title,
      slug: generateSlug(data.title),
      content: data.content,
      thumbnail: data.thumbnail,
      tags: data.tags,
      author: { connect: { id: userId } },
      ...(data.categoryId && {
        category: { connect: { id: Number(data.categoryId) } }
      })
    },
  });
};

const getAllPosts = async (query: any) => {
  const { page = 1, limit = 10, search, categoryId } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const whereCondition: any = {};
  
  if (search) {
    whereCondition.OR = [
      { title: { contains: search } },
      { content: { contains: search } },
    ];
  }
  if (categoryId) {
    whereCondition.categoryId = Number(categoryId);
  }

  const posts = await prisma.blogPost.findMany({
    where: whereCondition,
    skip,
    take: Number(limit),
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      category: { select: { id: true, name: true } },
      _count: { select: { comments: true } },
    },
  });

  const total = await prisma.blogPost.count({ where: whereCondition });

  return {
    posts,
    pagination: {
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
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

  const formattedPost = {
    ...post,
    author: {
      ...post.author,
      bio: post.author.lecturerProfile?.bio || null, 
      lecturerProfile: undefined 
    }
  };

  return formattedPost;
};

const updatePost = async (id: number, userId: number, data: any) => {
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) throw new ApiError(StatusCodes.NOT_FOUND, "Bài viết không tìm thấy!");
  
  if (post.authorId !== userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, "Bạn không có quyền sửa bài này!");
  }

  return await prisma.blogPost.update({ where: { id }, data });
};

const deletePost = async (id: number, userId: number) => {
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) throw new ApiError(StatusCodes.NOT_FOUND, "Bài viết không tìm thấy!");

  const requestUser = await prisma.user.findUnique({ where: { id: userId } });
  const isAuthor = post.authorId === userId;
  const isAdmin = requestUser?.role === 'admin';

  if (!isAuthor && !isAdmin) {
      throw new ApiError(StatusCodes.FORBIDDEN, "Bạn không có quyền xóa bài này!");
  }

  return await prisma.blogPost.delete({ where: { id } });
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
