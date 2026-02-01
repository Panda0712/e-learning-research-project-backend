import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

// Helper tạo slug
const generateSlug = (name: string) => {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
};

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

const getPostDetail = async (id: number) => {
  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: {
      author: { 
        select: { 
          id: true, 
          firstName: true, 
          lastName: true, 
          avatar: true, 
          lecturerProfile: {
            select: { bio: true }
          }
        } 
      },
      category: true,
      comments: {
        where: { parentId: null },
        include: {
          user: { 
            select: { id: true, firstName: true, lastName: true, avatar: true } 
          },
          children: {
            include: {
                user: { select: { id: true, firstName: true, lastName: true, avatar: true } }
            },
            orderBy: { createdAt: "asc" }
          }
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!post) throw new ApiError(StatusCodes.NOT_FOUND, "Bài viết không tồn tại!");

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

// ===========================
// 3. PHẦN BLOG COMMENT
// ===========================
const createComment = async (userId: number, data: any) => {
  const post = await prisma.blogPost.findUnique({ where: { id: Number(data.postId) } });
  if (!post) throw new ApiError(StatusCodes.NOT_FOUND, "Bài viết không tồn tại!");

  return await prisma.blogComment.create({
    data: {
      content: data.content,
      post: { connect: { id: Number(data.postId) } },
      user: { connect: { id: userId } },
      ...(data.parentId && {
        parent: { connect: { id: Number(data.parentId) } }
      })
    },
    include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } }
    }
  });
};

const deleteComment = async (id: number, userId: number) => {
    const comment = await prisma.blogComment.findUnique({ 
        where: { id }, include: { post: true }
    });
    if (!comment) throw new ApiError(StatusCodes.NOT_FOUND, "Bình luận không tồn tại!");

    const requestUser = await prisma.user.findUnique({ where: { id: userId } });
    const isOwner = comment.userId === userId;
    const isAdmin = requestUser?.role === 'admin';
    const isPostAuthor = comment.post.authorId === userId;

    if (!isOwner && !isAdmin && !isPostAuthor) {
        throw new ApiError(StatusCodes.FORBIDDEN, "Bạn không có quyền xóa bình luận này!");
    }

    return await prisma.blogComment.delete({ where: { id } });
}

export const blogService = {
  // Category
  createCategory, getAllCategories, updateCategory, deleteCategory,
  // Post
  createPost, getAllPosts, getPostDetail, updatePost, deletePost,
  // Comment
  createComment, deleteComment
};