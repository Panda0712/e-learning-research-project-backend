import { CloudinaryProvider } from "@/providers/CloudinaryProvider.js";
import { blogService } from "@/services/blogService.js";
import { StatusCodes } from "http-status-codes";
// BLOG CATEGORY CONTROLLER
const createBlogCategory = async (req, res, next) => {
    try {
        const result = await blogService.createBlogCategory(req.body);
        res.status(StatusCodes.CREATED).json(result);
    }
    catch (error) {
        next(error);
    }
};
const getAllBlogCategories = async (req, res, next) => {
    try {
        const result = await blogService.getAllBlogCategories();
        res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
const updateBlogCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await blogService.updateBlogCategory(Number(id), req.body);
        res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
const deleteBlogCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await blogService.deleteBlogCategory(Number(id));
        res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
// BLOG POST CONTROLLER
const getAllPosts = async (req, res, next) => {
    try {
        const result = await blogService.getAllPosts();
        res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
const getPostDetail = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await blogService.getPostDetail(Number(id));
        res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
const createPost = async (req, res, next) => {
    try {
        const authorId = Number(req.jwtDecoded.id);
        const result = await blogService.createPost({ ...req.body, authorId });
        res.status(StatusCodes.CREATED).json(result);
    }
    catch (error) {
        next(error);
    }
};
const updatePost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await blogService.updatePost(Number(id), req.body);
        res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
const deletePost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await blogService.deletePost(Number(id));
        res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
// BLOG COMMENT CONTROLLER
const createComment = async (req, res, next) => {
    try {
        const userId = Number(req.jwtDecoded.id);
        const result = await blogService.createComment({ ...req.body, userId });
        res.status(StatusCodes.CREATED).json(result);
    }
    catch (error) {
        next(error);
    }
};
const updateComment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await blogService.updateComment(Number(id), req.body);
        res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
const deleteComment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await blogService.deleteComment(Number(id));
        res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
const uploadBlogThumbnail = async (req, res, next) => {
    try {
        const file = req.file;
        const uploadedThumbnail = await CloudinaryProvider.uploadImage(file.buffer);
        res.status(StatusCodes.OK).json(uploadedThumbnail);
    }
    catch (error) {
        next(error);
    }
};
export const blogController = {
    createBlogCategory,
    getAllBlogCategories,
    updateBlogCategory,
    deleteBlogCategory,
    createPost,
    updatePost,
    deletePost,
    getAllPosts,
    getPostDetail,
    uploadBlogThumbnail,
    createComment,
    updateComment,
    deleteComment,
};
//# sourceMappingURL=blogController.js.map