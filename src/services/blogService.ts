import { prisma } from "@/lib/prisma.js";
import { CreateBlogPost, UpdateBlogPost } from "@/types/blog.type.js";
import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { notificationService } from "./notificationService.js";
import { resourceService } from "./resourceService.js";

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
    throw error;
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
    throw error;
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
    throw error;
  }
};

// BLOG POST SERVICE
const createPost = async (reqBody: CreateBlogPost) => {
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
    const newPost = await prisma.$transaction(async (tx) => {
      const createdResource =
        await resourceService.createResourceWithTransaction(
          {
            publicId: reqBody.thumbnail.publicId,
            fileSize: reqBody.thumbnail.fileSize ?? null,
            fileType: reqBody.thumbnail.fileType ?? null,
            fileUrl: reqBody.thumbnail.fileUrl,
          },
          tx,
        );

      const post = await tx.blogPost.create({
        data: {
          authorId: reqBody.authorId,
          title: reqBody.title,
          slug: reqBody.slug,
          content: reqBody.content,
          thumbnailId: createdResource.id,
          categoryId: reqBody.categoryId,
        },
      });

      return post;
    });

    const studentsWhoPurchasedLecturerCourses = await prisma.user.findMany({
      where: {
        isDestroyed: false,
        orders: {
          some: {
            isDestroyed: false,
            paymentStatus: "paid",
            items: {
              some: {
                isDestroyed: false,
                OR: [
                  { lecturerId: reqBody.authorId },
                  { course: { lecturerId: reqBody.authorId } },
                ],
              },
            },
          },
        },
      },
      select: { id: true },
    });

    await notificationService.createAndDispatchNotificationsForUsers(
      {
        userIds: studentsWhoPurchasedLecturerCourses.map((user) => user.id),
        title: "New blog from your lecturer",
        message: `A lecturer you purchased from has posted: ${newPost.title}`,
        type: "blog",
        relatedId: newPost.id,
      },
      { dedupe: true },
    );

    return newPost;
  } catch (error: any) {
    throw error;
  }
};

const mapBlogPost = (post: any) => {
  const authorName = `${post?.author?.firstName || ""} ${post?.author?.lastName || ""}`.trim();

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    date: post.createdAt,
    category: post?.category?.name || "Uncategorized",
    categoryId: post?.categoryId,
    image: post?.thumbnail?.fileUrl || "",
    thumbnail: post?.thumbnail
      ? {
          publicId: post.thumbnail.publicId,
          fileUrl: post.thumbnail.fileUrl,
          fileSize: post.thumbnail.fileSize,
          fileType: post.thumbnail.fileType,
        }
      : null,
    author: authorName || "Unknown",
    authorId: post.authorId,
    totalComments: post?._count?.comments || 0,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
};

const getAllPosts = async ({
  page,
  itemsPerPage,
}: {
  page?: number;
  itemsPerPage?: number;
}) => {
  const hasPagination = Boolean(page && itemsPerPage);

  const baseInclude = {
    _count: {
      select: { comments: true },
    },
    author: {
      select: {
        firstName: true,
        lastName: true,
      },
    },
    category: {
      select: {
        id: true,
        name: true,
        slug: true,
      },
    },
    thumbnail: {
      select: {
        publicId: true,
        fileUrl: true,
        fileSize: true,
        fileType: true,
      },
    },
  };

  if (!hasPagination) {
    const posts = await prisma.blogPost.findMany({
      where: { isDestroyed: false },
      include: baseInclude,
      orderBy: { createdAt: "desc" },
    });

    return posts.map(mapBlogPost);
  }

  const normalizedPage = Number.isInteger(page) && (page as number) > 0 ? (page as number) : 1;
  const normalizedItemsPerPage =
    Number.isInteger(itemsPerPage) && (itemsPerPage as number) > 0
      ? (itemsPerPage as number)
      : 8;

  const skip = (normalizedPage - 1) * normalizedItemsPerPage;

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where: { isDestroyed: false },
      include: baseInclude,
      skip,
      take: normalizedItemsPerPage,
      orderBy: { createdAt: "desc" },
    }),
    prisma.blogPost.count({ where: { isDestroyed: false } }),
  ]);

  return {
    data: posts.map((post, index) => ({
      ...mapBlogPost(post),
      stt: skip + index + 1,
    })),
    pagination: {
      page: normalizedPage,
      itemsPerPage: normalizedItemsPerPage,
      total,
      totalPages: Math.ceil(total / normalizedItemsPerPage),
    },
  };
};

const getAdminPosts = async ({
  page,
  itemsPerPage,
}: {
  page: number;
  itemsPerPage: number;
}) => {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safeItemsPerPage =
    Number.isFinite(itemsPerPage) && itemsPerPage > 0 ? itemsPerPage : 10;

  const [posts, totalPosts] = await Promise.all([
    prisma.blogPost.findMany({
      where: { isDestroyed: false },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        thumbnail: {
          select: {
            fileUrl: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * safeItemsPerPage,
      take: safeItemsPerPage,
    }),
    prisma.blogPost.count({ where: { isDestroyed: false } }),
  ]);

  return {
    posts,
    totalPosts,
    page: safePage,
    itemsPerPage: safeItemsPerPage,
    totalPages: Math.max(1, Math.ceil(totalPosts / safeItemsPerPage)),
  };
};

const getPostDetail = async (id: number) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { id, isDestroyed: false },
      include: {
        _count: {
          select: { comments: true },
        },
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        thumbnail: {
          select: {
            publicId: true,
            fileUrl: true,
            fileSize: true,
            fileType: true,
          },
        },
      },
    });

    if (!post) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Post not found!");
    }

    return mapBlogPost(post);
  } catch (error: any) {
    throw error;
  }
};

const getAdminPostDetail = async (id: number) => {
  const post = await prisma.blogPost.findUnique({
    where: { id, isDestroyed: false },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      thumbnail: {
        select: {
          id: true,
          publicId: true,
          fileUrl: true,
          fileType: true,
          fileSize: true,
        },
      },
      comments: {
        where: { isDestroyed: false },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: { comments: true },
      },
    },
  });

  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found!");
  }

  return post;
};

const updatePost = async (id: number, reqBody: UpdateBlogPost) => {
  try {
    // check post existence
    const checkPost = await prisma.blogPost.findUnique({
      where: { id, isDestroyed: false },
    });

    if (!checkPost) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Post not found!");
    }

    // update post
    if (reqBody?.thumbnail) {
      return await prisma.$transaction(async (tx) => {
        let blogThumbnailId = checkPost.thumbnailId;

        const createdResource =
          await resourceService.createResourceWithTransaction(
            {
              publicId: reqBody.thumbnail!.publicId,
              fileSize: reqBody.thumbnail!.fileSize ?? null,
              fileType: reqBody.thumbnail!.fileType ?? null,
              fileUrl: reqBody.thumbnail!.fileUrl,
            },
            tx,
          );

        blogThumbnailId = createdResource.id;

        if (checkPost.thumbnailId)
          await resourceService.deleteResourceWithTransaction(
            checkPost.thumbnailId,
            tx,
          );

        const updatedPost = await tx.blogPost.update({
          where: { id },
          data: {
            title: reqBody.title ?? checkPost.title,
            content: reqBody.content ?? checkPost.content,
            categoryId: reqBody.categoryId ?? checkPost.categoryId,
            thumbnailId: blogThumbnailId,
          },
        });

        return updatedPost;
      });
    }

    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: {
        title: reqBody.title ?? checkPost.title,
        content: reqBody.content ?? checkPost.content,
        categoryId: reqBody.categoryId ?? checkPost.categoryId,
      },
    });

    return updatedPost;
  } catch (error: any) {
    throw error;
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
    throw error;
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

    let parentCommentUserId: number | null = null;
    if (reqBody.parentId) {
      const parentComment = await prisma.blogComment.findUnique({
        where: { id: reqBody.parentId, isDestroyed: false },
        select: { id: true, blogId: true, userId: true },
      });

      if (!parentComment) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Parent comment not found!");
      }

      if (parentComment.blogId !== reqBody.blogId) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Parent comment does not belong to this blog post!",
        );
      }

      parentCommentUserId = parentComment.userId;
    }

    // create new comment
    const newComment = await prisma.blogComment.create({
      data: {
        content: reqBody.content,
        blogId: reqBody.blogId,
        userId: reqBody.userId,
        parentId: reqBody.parentId || null,
      },
    });

    if (parentCommentUserId && parentCommentUserId !== reqBody.userId) {
      await notificationService.createAndDispatchNotification(
        {
          userId: parentCommentUserId,
          title: "New reply to your comment",
          message: "Someone replied to your blog comment.",
          type: "comment_reply",
          relatedId: newComment.id,
        },
        { dedupe: true },
      );
    }

    return newComment;
  } catch (error: any) {
    throw error;
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
    throw error;
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
    throw error;
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
  getAdminPosts,
  getPostDetail,
  getAdminPostDetail,

  createComment,
  updateComment,
  deleteComment,
};
