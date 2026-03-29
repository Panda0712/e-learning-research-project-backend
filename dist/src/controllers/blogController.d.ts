import { NextFunction, Request, Response } from "express";
export declare const blogController: {
    createBlogCategory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllBlogCategories: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateBlogCategory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteBlogCategory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createPost: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updatePost: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deletePost: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllPosts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPostDetail: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    uploadBlogThumbnail: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createComment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateComment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteComment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
//# sourceMappingURL=blogController.d.ts.map