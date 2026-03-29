import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { resourceService } from "./resourceService.js";
// BLOG CATEGORY SERVICE
const createBlogCategory = async (reqBody) => {
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
    }
    catch (error) {
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
const updateBlogCategory = async (id, reqBody) => {
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
    }
    catch (error) {
        throw error;
    }
};
const deleteBlogCategory = async (id) => {
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
    }
    catch (error) {
        throw error;
    }
};
// BLOG POST SERVICE
const createPost = async (reqBody) => {
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
        return await prisma.$transaction(async (tx) => {
            const createdResource = await resourceService.createResourceWithTransaction({
                publicId: reqBody.thumbnail.publicId,
                fileSize: reqBody.thumbnail.fileSize ?? null,
                fileType: reqBody.thumbnail.fileType ?? null,
                fileUrl: reqBody.thumbnail.fileUrl,
            }, tx);
            const newPost = await tx.blogPost.create({
                data: {
                    authorId: reqBody.authorId,
                    title: reqBody.title,
                    slug: reqBody.slug,
                    content: reqBody.content,
                    thumbnailId: createdResource.id,
                    categoryId: reqBody.categoryId,
                },
            });
            return newPost;
        });
    }
    catch (error) {
        throw error;
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
const getPostDetail = async (id) => {
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
    }
    catch (error) {
        throw error;
    }
};
const updatePost = async (id, reqBody) => {
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
                const createdResource = await resourceService.createResourceWithTransaction({
                    publicId: reqBody.thumbnail.publicId,
                    fileSize: reqBody.thumbnail.fileSize ?? null,
                    fileType: reqBody.thumbnail.fileType ?? null,
                    fileUrl: reqBody.thumbnail.fileUrl,
                }, tx);
                blogThumbnailId = createdResource.id;
                if (checkPost.thumbnailId)
                    await resourceService.deleteResourceWithTransaction(checkPost.thumbnailId, tx);
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
    }
    catch (error) {
        throw error;
    }
};
const deletePost = async (id) => {
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
    }
    catch (error) {
        throw error;
    }
};
// BLOG COMMENT SERVICE
const createComment = async (reqBody) => {
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
    }
    catch (error) {
        throw error;
    }
};
const updateComment = async (id, reqBody) => {
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
    }
    catch (error) {
        throw error;
    }
};
const deleteComment = async (id) => {
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
    }
    catch (error) {
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
    getPostDetail,
    createComment,
    updateComment,
    deleteComment,
};
//# sourceMappingURL=blogService.js.map