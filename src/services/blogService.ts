import { prisma } from "@/lib/prisma.js";
import {
  BanBlogCommentUserPayload,
  BlogActor,
  BlogPostStatus,
  CreateBlogPost,
  UpdateBlogPost,
  UpdateBlogPostStatus,
} from "@/types/blog.type.js";
import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { notificationService } from "./notificationService.js";
import { resourceService } from "./resourceService.js";

const PUBLIC_BLOG_STATUSES: BlogPostStatus[] = ["published"];

const LECTURER_EDITABLE_STATUSES: BlogPostStatus[] = ["draft", "pending"];

const CATEGORY_INCLUDE = {
  _count: {
    select: { posts: true },
  },
};

const BLOG_BASE_INCLUDE = {
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
  reviewedBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
};

const BLOG_COMMENT_INCLUDE = {
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
};

const isAuthorBannedUserTableMissing = (error: any) => {
  if (error?.code !== "P2021") return false;

  const metaTable = String(error?.meta?.table || "");
  const message = String(error?.message || "");

  return (
    metaTable.includes("AuthorBannedUser") ||
    message.includes("AuthorBannedUser")
  );
};

const ensureCategoryExists = async (categoryId: number) => {
  const checkCategory = await prisma.blogCategory.findUnique({
    where: { id: categoryId, isDestroyed: false },
  });

  if (!checkCategory) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Category not found!");
  }
};

const ensureSlugIsAvailable = async (slug: string, ignorePostId?: number) => {
  const checkSlug = await prisma.blogPost.findFirst({
    where: {
      slug,
      isDestroyed: false,
      ...(ignorePostId ? { NOT: { id: ignorePostId } } : {}),
    },
  });

  if (checkSlug) {
    throw new ApiError(StatusCodes.CONFLICT, "Post slug already exists!");
  }
};

const resolveCreateStatusByRole = (
  actorRole: BlogActor["role"],
  requestedStatus?: BlogPostStatus,
): BlogPostStatus => {
  if (actorRole === "admin") {
    return requestedStatus || "published";
  }

  if (requestedStatus === "published") {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Lecturer cannot publish directly. Submit for review instead.",
    );
  }

  if (requestedStatus === "rejected" || requestedStatus === "archived") {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Invalid status for lecturer while creating post.",
    );
  }

  return requestedStatus || "draft";
};

const resolveUpdateStatusByRole = (
  actorRole: BlogActor["role"],
  requestedStatus?: BlogPostStatus,
  currentStatus?: BlogPostStatus,
): BlogPostStatus | undefined => {
  if (!requestedStatus) return undefined;

  if (actorRole === "admin") return requestedStatus;

  if (!LECTURER_EDITABLE_STATUSES.includes(requestedStatus)) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Lecturer can only save draft or submit for review.",
    );
  }

  if (currentStatus === "published" && requestedStatus !== "pending") {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Published post can only be changed to pending by lecturer.",
    );
  }

  return requestedStatus;
};

const canAccessPost = (post: { status: BlogPostStatus; authorId: number }, actor?: BlogActor) => {
  if (PUBLIC_BLOG_STATUSES.includes(post.status)) return true;
  if (!actor) return false;
  if (actor.role === "admin") return true;
  return actor.role === "lecturer" && actor.id === post.authorId;
};

const mapBlogPost = (post: any) => {
  const authorName = `${post?.author?.firstName || ""} ${post?.author?.lastName || ""}`.trim();
  const reviewerName = `${post?.reviewedBy?.firstName || ""} ${post?.reviewedBy?.lastName || ""}`.trim();

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
    status: post.status,
    reviewNote: post.reviewNote,
    reviewedById: post.reviewedById,
    reviewedBy: reviewerName || null,
    publishedAt: post.publishedAt,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
};

const ensureCanModerateBlog = async (blogId: number, actor: BlogActor) => {
  const blog = await prisma.blogPost.findUnique({
    where: { id: blogId, isDestroyed: false },
    select: { id: true, authorId: true },
  });

  if (!blog) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found!");
  }

  if (actor.role !== "admin" && blog.authorId !== actor.id) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Only blog owner or admin can ban commenters.",
    );
  }

  return blog;
};

const getBlockedUserIdsByAuthor = async (authorId: number) => {
  let blockedRows: { userId: number }[] = [];

  try {
    blockedRows = await prisma.authorBannedUser.findMany({
      where: { authorId },
      select: { userId: true },
    });
  } catch (error: any) {
    if (!isAuthorBannedUserTableMissing(error)) {
      throw error;
    }
  }

  return new Set(blockedRows.map((row) => row.userId));
};

// BLOG CATEGORY SERVICE
const createBlogCategory = async (reqBody: { name: string; slug: string }) => {
  const checkSlug = await prisma.blogCategory.findUnique({
    where: { slug: reqBody.slug, isDestroyed: false },
  });

  if (checkSlug) {
    throw new ApiError(StatusCodes.CONFLICT, "Category slug already exists!");
  }

  return await prisma.blogCategory.create({
    data: {
      name: reqBody.name,
      slug: reqBody.slug,
    },
  });
};

const getAllBlogCategories = async () => {
  return await prisma.blogCategory.findMany({
    where: { isDestroyed: false },
    include: CATEGORY_INCLUDE,
  });
};

const updateBlogCategory = async (
  id: number,
  reqBody: { name: string; slug: string },
) => {
  const checkCategory = await prisma.blogCategory.findUnique({
    where: { id, isDestroyed: false },
  });

  if (!checkCategory) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Category not found!");
  }

  return await prisma.blogCategory.update({
    where: { id },
    data: {
      name: reqBody.name,
      slug: reqBody.slug,
    },
  });
};

const deleteBlogCategory = async (id: number) => {
  const checkCategory = await prisma.blogCategory.findUnique({
    where: { id, isDestroyed: false },
  });

  if (!checkCategory) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Category not found!");
  }

  await prisma.blogCategory.delete({
    where: { id },
  });

  return { message: "Delete category successfully!" };
};

// BLOG POST SERVICE
const createPost = async (reqBody: CreateBlogPost, actor: BlogActor) => {
  await ensureCategoryExists(reqBody.categoryId);
  await ensureSlugIsAvailable(reqBody.slug);

  if (!reqBody.thumbnail) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Thumbnail is required!");
  }

  const targetStatus = resolveCreateStatusByRole(actor.role, reqBody.status);

  const now = new Date();

  const newPost = await prisma.$transaction(async (tx) => {
    const createdResource = await resourceService.createResourceWithTransaction(
      {
        publicId: reqBody.thumbnail.publicId,
        fileSize: reqBody.thumbnail.fileSize ?? null,
        fileType: reqBody.thumbnail.fileType ?? null,
        fileUrl: reqBody.thumbnail.fileUrl,
      },
      tx,
    );

    return await tx.blogPost.create({
      data: {
        authorId: reqBody.authorId,
        title: reqBody.title,
        slug: reqBody.slug,
        content: reqBody.content,
        thumbnailId: createdResource.id,
        categoryId: reqBody.categoryId,
        status: targetStatus,
        reviewedById: actor.role === "admin" ? actor.id : null,
        reviewNote: actor.role === "admin" ? "Created and published by admin." : null,
        publishedAt: targetStatus === "published" ? now : null,
      },
    });
  });

  if (newPost.status === "published") {
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
  }

  return newPost;
};

const getAllPosts = async ({
  page,
  itemsPerPage,
}: {
  page?: number;
  itemsPerPage?: number;
}) => {
  const hasPagination = Boolean(page && itemsPerPage);

  if (!hasPagination) {
    const posts = await prisma.blogPost.findMany({
      where: {
        isDestroyed: false,
        status: { in: PUBLIC_BLOG_STATUSES },
      },
      include: BLOG_BASE_INCLUDE,
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

  const where = {
    isDestroyed: false,
    status: { in: PUBLIC_BLOG_STATUSES },
  };

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      include: BLOG_BASE_INCLUDE,
      skip,
      take: normalizedItemsPerPage,
      orderBy: { createdAt: "desc" },
    }),
    prisma.blogPost.count({ where }),
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
  status,
}: {
  page: number;
  itemsPerPage: number;
  status?: BlogPostStatus;
}) => {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safeItemsPerPage =
    Number.isFinite(itemsPerPage) && itemsPerPage > 0 ? itemsPerPage : 10;

  const where = {
    isDestroyed: false,
    ...(status ? { status } : {}),
  };

  const [posts, totalPosts] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      include: BLOG_BASE_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * safeItemsPerPage,
      take: safeItemsPerPage,
    }),
    prisma.blogPost.count({ where }),
  ]);

  return {
    data: posts.map((post, index) => ({
      ...mapBlogPost(post),
      stt: (safePage - 1) * safeItemsPerPage + index + 1,
    })),
    pagination: {
      page: safePage,
      itemsPerPage: safeItemsPerPage,
      total: totalPosts,
      totalPages: Math.max(1, Math.ceil(totalPosts / safeItemsPerPage)),
    },
  };
};

const getLecturerPosts = async ({
  page,
  itemsPerPage,
  actor,
  status,
}: {
  page: number;
  itemsPerPage: number;
  actor: BlogActor;
  status?: BlogPostStatus;
}) => {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safeItemsPerPage =
    Number.isFinite(itemsPerPage) && itemsPerPage > 0 ? itemsPerPage : 10;

  const where = {
    isDestroyed: false,
    authorId: actor.id,
    ...(status ? { status } : {}),
  };

  const [posts, totalPosts] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      include: BLOG_BASE_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * safeItemsPerPage,
      take: safeItemsPerPage,
    }),
    prisma.blogPost.count({ where }),
  ]);

  return {
    data: posts.map((post, index) => ({
      ...mapBlogPost(post),
      stt: (safePage - 1) * safeItemsPerPage + index + 1,
    })),
    pagination: {
      page: safePage,
      itemsPerPage: safeItemsPerPage,
      total: totalPosts,
      totalPages: Math.max(1, Math.ceil(totalPosts / safeItemsPerPage)),
    },
  };
};

const getPostDetail = async (id: number, actor?: BlogActor) => {
  const post = await prisma.blogPost.findUnique({
    where: { id, isDestroyed: false },
    include: BLOG_BASE_INCLUDE,
  });

  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found!");
  }

  if (!canAccessPost(post as any, actor)) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found!");
  }

  return mapBlogPost(post);
};

const getAdminPostDetail = async (id: number) => {
  const post = await prisma.blogPost.findUnique({
    where: { id, isDestroyed: false },
    include: {
      ...BLOG_BASE_INCLUDE,
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
    },
  });

  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found!");
  }

  return {
    ...mapBlogPost(post),
    comments: post.comments,
  };
};

const updatePost = async (id: number, reqBody: UpdateBlogPost, actor: BlogActor) => {
  const checkPost = await prisma.blogPost.findUnique({
    where: { id, isDestroyed: false },
  });

  if (!checkPost) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found!");
  }

  if (actor.role === "lecturer" && checkPost.authorId !== actor.id) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You can only update your own blog posts.",
    );
  }

  if (reqBody.categoryId) {
    await ensureCategoryExists(reqBody.categoryId);
  }

  if (reqBody.status) {
    resolveUpdateStatusByRole(actor.role, reqBody.status, checkPost.status as BlogPostStatus);
  }

  const statusToWrite = reqBody.status
    ? resolveUpdateStatusByRole(
        actor.role,
        reqBody.status,
        checkPost.status as BlogPostStatus,
      )
    : undefined;

  const patchData: any = {
    title: reqBody.title ?? checkPost.title,
    content: reqBody.content ?? checkPost.content,
    categoryId: reqBody.categoryId ?? checkPost.categoryId,
  };

  if (statusToWrite) {
    patchData.status = statusToWrite;

    if (statusToWrite === "pending") {
      patchData.reviewNote = null;
      patchData.reviewedById = null;
      patchData.publishedAt = null;
    }

    if (statusToWrite === "draft") {
      patchData.publishedAt = null;
    }

    if (statusToWrite === "published" && actor.role === "admin") {
      patchData.publishedAt = new Date();
      patchData.reviewedById = actor.id;
      patchData.reviewNote = reqBody.status === "published" ? "Approved by admin." : null;
    }
  }

  if (reqBody?.thumbnail) {
    return await prisma.$transaction(async (tx) => {
      let blogThumbnailId = checkPost.thumbnailId;

      const createdResource = await resourceService.createResourceWithTransaction(
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
        await resourceService.deleteResourceWithTransaction(checkPost.thumbnailId, tx);

      return await tx.blogPost.update({
        where: { id },
        data: {
          ...patchData,
          thumbnailId: blogThumbnailId,
        },
      });
    });
  }

  return await prisma.blogPost.update({
    where: { id },
    data: patchData,
  });
};

const updatePostStatus = async (
  id: number,
  reqBody: UpdateBlogPostStatus,
  actor: BlogActor,
) => {
  if (actor.role !== "admin") {
    throw new ApiError(StatusCodes.FORBIDDEN, "Only admin can review blog status.");
  }

  const checkPost = await prisma.blogPost.findUnique({
    where: { id, isDestroyed: false },
  });

  if (!checkPost) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found!");
  }

  const nextData: any = {
    status: reqBody.status,
    reviewedById: actor.id,
    reviewNote: reqBody.reviewNote ?? null,
  };

  if (reqBody.status === "published") {
    nextData.publishedAt = new Date();
  }

  if (reqBody.status === "rejected" || reqBody.status === "draft" || reqBody.status === "pending") {
    nextData.publishedAt = null;
  }

  return await prisma.blogPost.update({
    where: { id },
    data: nextData,
  });
};

const deletePost = async (id: number, actor: BlogActor) => {
  const checkPost = await prisma.blogPost.findUnique({
    where: { id, isDestroyed: false },
  });

  if (!checkPost) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found!");
  }

  if (actor.role === "lecturer" && checkPost.authorId !== actor.id) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You can only delete your own blog posts.",
    );
  }

  await prisma.blogPost.delete({
    where: { id },
  });

  return { message: "Deleted blog post successfully!" };
};

// BLOG COMMENT SERVICE
const createComment = async (reqBody: {
  content: string;
  userId: number;
  blogId: number;
  parentId?: number;
}) => {
  const checkPost = await prisma.blogPost.findUnique({
    where: { id: reqBody.blogId, isDestroyed: false },
  });

  if (!checkPost || !PUBLIC_BLOG_STATUSES.includes(checkPost.status as BlogPostStatus)) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Blog post not found!");
  }

  let activeBan: { id: number } | null = null;

  try {
    activeBan = await prisma.authorBannedUser.findFirst({
      where: {
        authorId: checkPost.authorId,
        userId: reqBody.userId,
      },
      select: { id: true },
    });
  } catch (error: any) {
    if (!isAuthorBannedUserTableMissing(error)) {
      throw error;
    }
  }

  if (activeBan) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You are banned from commenting on this blog post.",
    );
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

  const newComment = await prisma.blogComment.create({
    data: {
      content: reqBody.content,
      blogId: reqBody.blogId,
      userId: reqBody.userId,
      parentId: reqBody.parentId || null,
    },
  });

  if (checkPost.authorId !== reqBody.userId) {
    await notificationService.createAndDispatchNotification(
      {
        userId: checkPost.authorId,
        title: "New comment on your blog",
        message: `Your post \"${checkPost.title}\" has a new comment.`,
        type: "blog_comment",
        relatedId: newComment.id,
      },
      { dedupe: true },
    );
  }

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
};

const getCommentsByBlogId = async (blogId: number) => {
  const checkPost = await prisma.blogPost.findUnique({
    where: { id: blogId, isDestroyed: false },
    select: { id: true, status: true, authorId: true },
  });

  if (!checkPost || !PUBLIC_BLOG_STATUSES.includes(checkPost.status as BlogPostStatus)) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Blog post not found!");
  }

  const [comments, bans] = await Promise.all([
    prisma.blogComment.findMany({
      where: {
        blogId,
        isDestroyed: false,
      },
      include: BLOG_COMMENT_INCLUDE,
      orderBy: { createdAt: "asc" },
    }),
    getBlockedUserIdsByAuthor(checkPost.authorId),
  ]);

  return comments.map((comment) => ({
    ...comment,
    isBannedUser: bans.has(comment.userId),
  }));
};

const banCommentUser = async (
  blogId: number,
  reqBody: BanBlogCommentUserPayload,
  actor: BlogActor,
) => {
  const blog = await ensureCanModerateBlog(blogId, actor);

  try {
    await prisma.authorBannedUser.findFirst({
      where: { authorId: blog.authorId },
      select: { id: true },
    });
  } catch (error: any) {
    if (isAuthorBannedUserTableMissing(error)) {
      throw new ApiError(
        StatusCodes.SERVICE_UNAVAILABLE,
        "Ban commenter feature is unavailable because table AuthorBannedUser is missing.",
      );
    }
    throw error;
  }

  if (reqBody.userId === blog.authorId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Cannot ban blog owner.");
  }

  const checkTargetUser = await prisma.user.findUnique({
    where: { id: reqBody.userId, isDestroyed: false },
    select: { id: true },
  });

  if (!checkTargetUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
  }

  const ban = await prisma.authorBannedUser.upsert({
    where: {
      authorId_userId: {
        authorId: blog.authorId,
        userId: reqBody.userId,
      },
    },
    update: {},
    create: {
      authorId: blog.authorId,
      userId: reqBody.userId,
    },
  });

  if (reqBody.reason) {
    await notificationService.createAndDispatchNotification(
      {
        userId: reqBody.userId,
        title: "Comment access restricted",
        message: reqBody.reason,
        type: "blog_comment",
        relatedId: blogId,
      },
      { dedupe: true },
    );
  }

  return ban;
};

const unbanCommentUser = async (blogId: number, userId: number, actor: BlogActor) => {
  await ensureCanModerateBlog(blogId, actor);

  const blog = await prisma.blogPost.findUnique({
    where: { id: blogId, isDestroyed: false },
    select: { authorId: true },
  });

  if (!blog) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found!");
  }

  let checkBan: { id: number } | null = null;

  try {
    checkBan = await prisma.authorBannedUser.findFirst({
      where: {
        authorId: blog.authorId,
        userId,
      },
      select: { id: true },
    });
  } catch (error: any) {
    if (isAuthorBannedUserTableMissing(error)) {
      throw new ApiError(
        StatusCodes.SERVICE_UNAVAILABLE,
        "Ban commenter feature is unavailable because table AuthorBannedUser is missing.",
      );
    }
    throw error;
  }

  if (!checkBan) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Ban record not found!");
  }

  return await prisma.authorBannedUser.delete({
    where: { id: checkBan.id },
  });
};

const getBannedCommentUsers = async (blogId: number, actor: BlogActor) => {
  await ensureCanModerateBlog(blogId, actor);

  const blog = await prisma.blogPost.findUnique({
    where: { id: blogId, isDestroyed: false },
    select: { authorId: true },
  });

  if (!blog) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found!");
  }

  try {
    return await prisma.authorBannedUser.findMany({
      where: {
        authorId: blog.authorId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error: any) {
    if (isAuthorBannedUserTableMissing(error)) {
      return [];
    }
    throw error;
  }
};

const updateComment = async (
  id: number,
  reqBody: { content: string; blogId: number; parentId?: number },
) => {
  const checkComment = await prisma.blogComment.findUnique({
    where: { id, isDestroyed: false },
  });

  if (!checkComment) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Blog comment not found!");
  }

  return await prisma.blogComment.update({
    where: { id },
    data: {
      content: reqBody.content,
      blogId: reqBody.blogId,
    },
  });
};

const deleteComment = async (id: number) => {
  const checkComment = await prisma.blogComment.findUnique({
    where: { id, isDestroyed: false },
  });

  if (!checkComment) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Comment not found!");
  }

  await prisma.blogComment.delete({
    where: { id },
  });

  return { message: "Deleted blog comment successfully!" };
};

export const blogService = {
  createBlogCategory,
  updateBlogCategory,
  getAllBlogCategories,
  deleteBlogCategory,

  createPost,
  updatePost,
  updatePostStatus,
  deletePost,
  getAllPosts,
  getAdminPosts,
  getLecturerPosts,
  getPostDetail,
  getAdminPostDetail,

  createComment,
  getCommentsByBlogId,
  updateComment,
  deleteComment,
  banCommentUser,
  unbanCommentUser,
  getBannedCommentUsers,
};
