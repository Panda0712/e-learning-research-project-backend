import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from "@/utils/constants.js";
import { StatusCodes } from "http-status-codes";
import { assessmentService } from "./assessmentService.js";
const createSubmission = async (data) => {
    try {
        // Check if student exists
        const student = await prisma.user.findUnique({
            where: { id: data.studentId, isDestroyed: false },
        });
        if (!student) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Student not found!");
        }
        // Check if assessment exists
        const assessment = await prisma.assessment.findUnique({
            where: { id: data.assessmentId, isDestroyed: false },
        });
        if (!assessment) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Assessment not found!");
        }
        // Check if quiz exists
        const quiz = await prisma.quiz.findUnique({
            where: { id: data.quizId, isDestroyed: false },
        });
        if (!quiz) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Quiz not found!");
        }
        const newSubmission = await prisma.submission.create({
            data: {
                assessmentId: data.assessmentId,
                quizId: data.quizId,
                studentId: data.studentId,
                score: data.score ?? null,
                status: data.status ?? null,
                feedback: data.feedback ?? null,
                submittedAt: data.submittedAt || new Date(),
            },
            include: {
                student: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                assessment: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                quiz: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });
        await assessmentService.updateAssessmentStats(data.assessmentId);
        return newSubmission;
    }
    catch (error) {
        throw error;
    }
};
const getSubmissionById = async (id) => {
    try {
        const submission = await prisma.submission.findUnique({
            where: { id, isDestroyed: false },
            include: {
                student: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                assessment: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                quiz: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });
        if (!submission) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Submission not found!");
        }
        return submission;
    }
    catch (error) {
        throw error;
    }
};
const getAllSubmissions = async (params) => {
    try {
        const page = params.page || DEFAULT_PAGE;
        const limit = params.limit || DEFAULT_ITEMS_PER_PAGE;
        const skip = (page - 1) * limit;
        const where = { isDestroyed: false };
        if (params.studentId) {
            where.studentId = params.studentId;
        }
        if (params.assessmentId) {
            where.assessmentId = params.assessmentId;
        }
        if (params.quizId) {
            where.quizId = params.quizId;
        }
        if (params.status) {
            where.status = params.status;
        }
        const [submissions, total] = await Promise.all([
            prisma.submission.findMany({
                where,
                skip,
                take: limit,
                orderBy: { submittedAt: "desc" },
                include: {
                    student: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    assessment: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                    quiz: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                },
            }),
            prisma.submission.count({ where }),
        ]);
        return {
            data: submissions,
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
const getSubmissionsByStudentId = async (params) => {
    try {
        const page = params.page || DEFAULT_PAGE;
        const limit = params.limit || DEFAULT_ITEMS_PER_PAGE;
        const skip = (page - 1) * limit;
        const where = {
            studentId: params.studentId,
            isDestroyed: false,
        };
        if (params.status) {
            where.status = params.status;
        }
        const [submissions, total] = await Promise.all([
            prisma.submission.findMany({
                where,
                skip,
                take: limit,
                orderBy: { submittedAt: "desc" },
                include: {
                    student: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    assessment: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                    quiz: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                },
            }),
            prisma.submission.count({ where }),
        ]);
        return {
            data: submissions,
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
const updateSubmission = async (id, data) => {
    try {
        const submission = await prisma.submission.findUnique({
            where: { id, isDestroyed: false },
        });
        if (!submission) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Submission not found!");
        }
        const updateData = {};
        if (data.score !== undefined)
            updateData.score = data.score;
        if (data.status !== undefined)
            updateData.status = data.status;
        if (data.feedback !== undefined)
            updateData.feedback = data.feedback;
        if (data.submittedAt !== undefined)
            updateData.submittedAt = data.submittedAt;
        const updatedSubmission = await prisma.submission.update({
            where: { id },
            data: updateData,
            include: {
                student: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                assessment: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                quiz: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });
        await assessmentService.updateAssessmentStats(updatedSubmission.assessmentId);
        return updatedSubmission;
    }
    catch (error) {
        throw error;
    }
};
const gradeSubmission = async (id, data) => {
    try {
        const submission = await prisma.submission.findUnique({
            where: { id, isDestroyed: false },
        });
        if (!submission) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Submission not found!");
        }
        const updateData = {
            score: data.score,
            status: data.status || "graded",
        };
        if (data.feedback !== undefined)
            updateData.feedback = data.feedback;
        const updatedSubmission = await prisma.submission.update({
            where: { id },
            data: updateData,
            include: {
                student: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                assessment: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                quiz: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });
        await assessmentService.updateAssessmentStats(updatedSubmission.assessmentId);
        return updatedSubmission;
    }
    catch (error) {
        throw error;
    }
};
const deleteSubmission = async (id) => {
    try {
        const submission = await prisma.submission.findUnique({
            where: { id, isDestroyed: false },
        });
        if (!submission) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Submission not found!");
        }
        await prisma.submission.update({
            where: { id },
            data: { isDestroyed: true },
        });
        await assessmentService.updateAssessmentStats(submission.assessmentId);
        return { message: "Submission deleted successfully!" };
    }
    catch (error) {
        throw error;
    }
};
export const submissionService = {
    createSubmission,
    getSubmissionById,
    getAllSubmissions,
    getSubmissionsByStudentId,
    updateSubmission,
    gradeSubmission,
    deleteSubmission,
};
//# sourceMappingURL=submissionService.js.map