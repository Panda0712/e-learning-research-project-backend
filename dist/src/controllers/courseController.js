import { CloudinaryProvider } from "@/providers/CloudinaryProvider.js";
import { StatusCodes } from "http-status-codes";
import { courseService } from "../services/courseService.js";
import { DEFAULT_ITEMS_PER_PAGE } from "@/utils/constants.js";
const createCourseCategory = async (req, res, next) => {
    try {
        const newCategory = await courseService.createCourseCategory(req.body);
        res.status(StatusCodes.CREATED).json(newCategory);
    }
    catch (error) {
        next(error);
    }
};
const getAllCourseCategories = async (req, res, next) => {
    try {
        const categories = await courseService.getAllCourseCategories();
        res.status(StatusCodes.OK).json(categories);
    }
    catch (error) {
        next(error);
    }
};
const createCourseFaq = async (req, res, next) => {
    try {
        const newFaq = await courseService.createCourseFaq(req.body);
        res.status(StatusCodes.CREATED).json(newFaq);
    }
    catch (error) {
        next(error);
    }
};
const getCourseFaqByCourseId = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const result = await courseService.getFaqsByCourseId(Number(courseId));
        res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
const getCourseFaqById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await courseService.getCourseFaqById(Number(id));
        res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
const createCourse = async (req, res, next) => {
    try {
        const lecturerId = Number(req.jwtDecoded?.id);
        const createdCourse = await courseService.createCourse({
            ...req.body,
            lecturerId,
        });
        res.status(StatusCodes.CREATED).json(createdCourse);
    }
    catch (error) {
        next(error);
    }
};
const updateCourse = async (req, res, next) => {
    try {
        const courseId = Number(req.params.id);
        const actorId = Number(req.jwtDecoded?.id);
        const updatedCourse = await courseService.updateCourse(courseId, req.body, actorId);
        res.status(StatusCodes.OK).json(updatedCourse);
    }
    catch (error) {
        next(error);
    }
};
const deleteCourse = async (req, res, next) => {
    try {
        const courseId = Number(req.params.id);
        const actorId = Number(req.jwtDecoded?.id);
        await courseService.deleteCourse(courseId, actorId);
        res.status(StatusCodes.OK).json({ message: "Course deleted successfully" });
    }
    catch (error) {
        next(error);
    }
};
const approveCourse = async (req, res, next) => {
    try {
        const courseId = Number(req.params.id);
        const actorId = Number(req.jwtDecoded?.id);
        await courseService.approveCourse(courseId, actorId);
        res
            .status(StatusCodes.OK)
            .json({ message: "Course approved successfully" });
    }
    catch (error) {
        next(error);
    }
};
const rejectCourse = async (req, res, next) => {
    try {
        const courseId = Number(req.params.id);
        const actorId = Number(req.jwtDecoded?.id);
        await courseService.rejectCourse(courseId, actorId);
        res
            .status(StatusCodes.OK)
            .json({ message: "Course rejected successfully" });
    }
    catch (error) {
        next(error);
    }
};
const getCourseById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const course = await courseService.getCourseById(Number(id));
        res.status(StatusCodes.OK).json(course);
    }
    catch (error) {
        next(error);
    }
};
const getListLecturersByStudentId = async (req, res, next) => {
    try {
        const { studentId } = req.params;
        const { page, itemsPerPage, q } = req.query;
        const result = await courseService.getListLecturersByStudentId(Number(studentId), Number(page), Number(itemsPerPage), q || "");
        res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
const getAllCoursesByStudentId = async (req, res, next) => {
    try {
        const { studentId } = req.params;
        const { page, itemsPerPage, q } = req.query;
        const { courses, totalCourses } = await courseService.getAllCoursesByStudentId(Number(studentId), Number(page), Number(itemsPerPage), q || "");
        res.status(StatusCodes.OK).json({ courses, totalCourses });
    }
    catch (error) {
        next(error);
    }
};
const getAllCoursesByLecturerId = async (req, res, next) => {
    try {
        const { lecturerId } = req.params;
        const courses = await courseService.getAllCoursesByLecturerId(Number(lecturerId));
        res.status(StatusCodes.OK).json(courses);
    }
    catch (error) {
        next(error);
    }
};
const getAllCoursesByCategoryId = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        const courses = await courseService.getAllCoursesByCategoryId(Number(categoryId));
        res.status(StatusCodes.OK).json(courses);
    }
    catch (error) {
        next(error);
    }
};
const getListCourses = async (req, res, next) => {
    try {
        const { page, itemsPerPage, q, categoryId, level, price } = req.query;
        const results = await courseService.getListCourses({
            page: Number(page),
            itemsPerPage: Number(itemsPerPage) || DEFAULT_ITEMS_PER_PAGE,
            q: q || "",
            categoryId: Number(categoryId),
            level: level,
            price: price,
        });
        res.status(StatusCodes.OK).json({
            courses: results.courses,
            totalCourses: results.totalCourses,
            pagination: {
                page,
                itemsPerPage,
                total: results.totalCourses,
                totalPages: Math.ceil(results.totalCourses /
                    (Number(itemsPerPage) ?? DEFAULT_ITEMS_PER_PAGE)),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
const uploadCourseThumbnail = async (req, res, next) => {
    try {
        const file = req.file;
        const uploadedThumbnail = await CloudinaryProvider.uploadImage(file.buffer);
        res.status(StatusCodes.OK).json(uploadedThumbnail);
    }
    catch (error) {
        next(error);
    }
};
const getMyLecturers = async (req, res, next) => {
    try {
        const studentId = Number(req.jwtDecoded.id);
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 6;
        const q = req.query.q || "";
        const result = await courseService.getListLecturersByStudentId(studentId, page, limit, q);
        return res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
const getMyCourses = async (req, res, next) => {
    try {
        const studentId = Number(req.jwtDecoded.id);
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 6;
        const q = req.query.q || "";
        const result = await courseService.getAllCoursesByStudentId(studentId, page, limit, q);
        return res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
export const courseController = {
    createCourseCategory,
    getAllCourseCategories,
    getCourseFaqById,
    createCourseFaq,
    getCourseFaqByCourseId,
    createCourse,
    updateCourse,
    deleteCourse,
    approveCourse,
    rejectCourse,
    getCourseById,
    getListCourses,
    getListLecturersByStudentId,
    getAllCoursesByStudentId,
    getAllCoursesByLecturerId,
    getAllCoursesByCategoryId,
    uploadCourseThumbnail,
    getMyLecturers,
    getMyCourses,
};
//# sourceMappingURL=courseController.js.map