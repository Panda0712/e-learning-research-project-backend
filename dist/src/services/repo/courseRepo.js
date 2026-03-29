import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
const ensureStudentCanLearnCourse = async (studentId, courseId) => {
    const purchased = await prisma.orderItem.findFirst({
        where: {
            courseId,
            isDestroyed: false,
            order: {
                studentId,
                isDestroyed: false,
                isSuccess: true,
            },
        },
        select: { id: true },
    });
    const enrolled = await prisma.enrollment.findFirst({
        where: {
            studentId,
            courseId,
            isDestroyed: false,
        },
        select: { id: true },
    });
    if (!purchased && !enrolled) {
        throw new ApiError(StatusCodes.FORBIDDEN, "You are not allowed to access this course content!");
    }
    return true;
};
export const courseRepo = {
    ensureStudentCanLearnCourse,
};
//# sourceMappingURL=courseRepo.js.map