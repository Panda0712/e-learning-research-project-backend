import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from "@/utils/constants.js";
import { StatusCodes } from "http-status-codes";
const createCourseReview = async (data) => {
    try {
        // Check if student exists
        const student = await prisma.user.findUnique({
            where: { id: data.studentId, isDestroyed: false },
        });
        if (!student) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Student not found!");
        }
        // Check if course exists
        const course = await prisma.course.findUnique({
            where: { id: data.courseId, isDestroyed: false },
        });
        if (!course) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Course not found!");
        }
        // Check if student already reviewed this course
        const existingReview = await prisma.courseReview.findFirst({
            where: {
                courseId: data.courseId,
                studentId: data.studentId,
                isDestroyed: false,
            },
        });
        if (existingReview) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "You have already reviewed this course!");
        }
        // Validate rating (1-5)
        if (data.rating < 1 || data.rating > 5) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Rating must be between 1 and 5!");
        }
        const newReview = await prisma.courseReview.create({
            data: {
                courseId: data.courseId,
                studentId: data.studentId,
                studentName: data.studentName || `${student.firstName} ${student.lastName}`,
                studentAvatar: data.studentAvatar ?? null,
                rating: data.rating,
                content: data.content ?? null,
            },
            include: {
                course: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                student: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        avatarId: true,
                    },
                },
            },
        });
        return newReview;
    }
    catch (error) {
        throw error;
    }
};
const getCourseReviewById = async (id) => {
    try {
        const review = await prisma.courseReview.findUnique({
            where: { id, isDestroyed: false },
            include: {
                course: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                student: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        avatarId: true,
                    },
                },
            },
        });
        if (!review) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Review not found!");
        }
        return review;
    }
    catch (error) {
        throw error;
    }
};
const getAllCourseReviews = async (params) => {
    try {
        const page = params.page || DEFAULT_PAGE;
        const limit = params.limit || DEFAULT_ITEMS_PER_PAGE;
        const skip = (page - 1) * limit;
        const where = { isDestroyed: false };
        if (params.courseId) {
            where.courseId = params.courseId;
        }
        if (params.studentId) {
            where.studentId = params.studentId;
        }
        if (params.rating) {
            where.rating = params.rating;
        }
        const [reviews, total] = await Promise.all([
            prisma.courseReview.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    course: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    student: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            avatarId: true,
                        },
                    },
                },
            }),
            prisma.courseReview.count({ where }),
        ]);
        return {
            data: reviews,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    catch (error) {
        throw error;
    }
};
const getReviewsByCourseId = async (params) => {
    try {
        const page = params.page || DEFAULT_PAGE;
        const limit = params.limit || DEFAULT_ITEMS_PER_PAGE;
        const skip = (page - 1) * limit;
        const where = {
            courseId: params.courseId,
            isDestroyed: false,
        };
        if (params.rating) {
            where.rating = params.rating;
        }
        const [reviews, total, allForStats] = await Promise.all([
            prisma.courseReview.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    course: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    student: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            avatarId: true,
                        },
                    },
                },
            }),
            prisma.courseReview.count({ where }),
            prisma.courseReview.findMany({
                where: { courseId: params.courseId, isDestroyed: false },
                select: { rating: true },
            }),
        ]);
        const statisticsData = {
            totalReviews: allForStats.length,
            oneStar: allForStats.filter((r) => r.rating === 1).length,
            twoStar: allForStats.filter((r) => r.rating === 2).length,
            threeStar: allForStats.filter((r) => r.rating === 3).length,
            fourStar: allForStats.filter((r) => r.rating === 4).length,
            fiveStar: allForStats.filter((r) => r.rating === 5).length,
        };
        const averageRating = allForStats.length > 0
            ? allForStats.reduce((sum, r) => sum + r.rating, 0) / allForStats.length
            : 0;
        return {
            data: reviews,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            statistics: {
                averageRating: Number(averageRating.toFixed(2)),
                ...statisticsData,
            },
        };
    }
    catch (error) {
        throw error;
    }
};
const getReviewsByStudentId = async (params) => {
    try {
        const page = params.page || DEFAULT_PAGE;
        const limit = params.limit || DEFAULT_ITEMS_PER_PAGE;
        const skip = (page - 1) * limit;
        const where = {
            studentId: params.studentId,
            isDestroyed: false,
        };
        const [reviews, total] = await Promise.all([
            prisma.courseReview.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    course: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    student: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            avatarId: true,
                        },
                    },
                },
            }),
            prisma.courseReview.count({ where }),
        ]);
        return {
            data: reviews,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    catch (error) {
        throw error;
    }
};
const updateCourseReview = async (id, data) => {
    try {
        const review = await prisma.courseReview.findUnique({
            where: { id, isDestroyed: false },
        });
        if (!review) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Review not found!");
        }
        // Validate rating if provided (1-5)
        if (data.rating && (data.rating < 1 || data.rating > 5)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Rating must be between 1 and 5!");
        }
        const updateData = {};
        if (data.rating !== undefined)
            updateData.rating = data.rating;
        if (data.content !== undefined)
            updateData.content = data.content;
        const updatedReview = await prisma.courseReview.update({
            where: { id },
            data: updateData,
            include: {
                course: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                student: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        avatarId: true,
                    },
                },
            },
        });
        return updatedReview;
    }
    catch (error) {
        throw error;
    }
};
const deleteCourseReview = async (id) => {
    try {
        const review = await prisma.courseReview.findUnique({
            where: { id, isDestroyed: false },
        });
        if (!review) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Review not found!");
        }
        await prisma.courseReview.update({
            where: { id },
            data: { isDestroyed: true },
        });
        return { message: "Review deleted successfully!" };
    }
    catch (error) {
        throw error;
    }
};
export const courseReviewService = {
    createCourseReview,
    getCourseReviewById,
    getAllCourseReviews,
    getReviewsByCourseId,
    getReviewsByStudentId,
    updateCourseReview,
    deleteCourseReview,
};
//# sourceMappingURL=courseReviewService.js.map