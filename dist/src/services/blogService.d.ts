import { CreateBlogPost, UpdateBlogPost } from "@/types/blog.type.js";
export declare const blogService: {
    createBlogCategory: (reqBody: {
        name: string;
        slug: string;
    }) => Promise<{
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        name: string;
        slug: string;
    }>;
    updateBlogCategory: (id: number, reqBody: {
        name: string;
        slug: string;
    }) => Promise<{
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        name: string;
        slug: string;
    }>;
    getAllBlogCategories: () => Promise<({
        _count: {
            posts: number;
        };
    } & {
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        name: string;
        slug: string;
    })[]>;
    deleteBlogCategory: (id: number) => Promise<{
        message: string;
    }>;
    createPost: (reqBody: CreateBlogPost) => Promise<{
        title: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        categoryId: number | null;
        thumbnailId: number | null;
        slug: string | null;
        content: string | null;
        totalComments: number | null;
        authorId: number;
    }>;
    updatePost: (id: number, reqBody: UpdateBlogPost) => Promise<{
        title: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        categoryId: number | null;
        thumbnailId: number | null;
        slug: string | null;
        content: string | null;
        totalComments: number | null;
        authorId: number;
    }>;
    deletePost: (id: number) => Promise<{
        message: string;
    }>;
    getAllPosts: () => Promise<({
        _count: {
            comments: number;
        };
    } & {
        title: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        categoryId: number | null;
        thumbnailId: number | null;
        slug: string | null;
        content: string | null;
        totalComments: number | null;
        authorId: number;
    })[]>;
    getPostDetail: (id: number) => Promise<({
        _count: {
            comments: number;
        };
    } & {
        title: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        categoryId: number | null;
        thumbnailId: number | null;
        slug: string | null;
        content: string | null;
        totalComments: number | null;
        authorId: number;
    }) | null>;
    createComment: (reqBody: {
        content: string;
        userId: number;
        blogId: number;
        parentId?: number;
    }) => Promise<{
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        content: string | null;
        blogId: number;
        userId: number;
        parentId: number | null;
    }>;
    updateComment: (id: number, reqBody: {
        content: string;
        blogId: number;
        parentId?: number;
    }) => Promise<{
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        content: string | null;
        blogId: number;
        userId: number;
        parentId: number | null;
    }>;
    deleteComment: (id: number) => Promise<{
        message: string;
    }>;
};
//# sourceMappingURL=blogService.d.ts.map