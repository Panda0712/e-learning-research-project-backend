import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
const getAllRequests = async () => {
    try {
        return await prisma.lecturerProfile.findMany({
            where: { isDestroyed: false },
            include: {
                lecturer: true,
                lecturerFile: true,
            },
            orderBy: { createdAt: "desc" },
        });
    }
    catch (error) {
        throw error;
    }
};
const approveRequest = async (id) => {
    try {
        const profile = await prisma.lecturerProfile.findUnique({
            where: { id, isDestroyed: false },
        });
        if (!profile) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Lecturer profile not found!");
        }
        return await prisma.$transaction(async (tx) => {
            await tx.lecturerProfile.update({
                where: { id },
                data: { isActive: true },
            });
            await tx.user.update({
                where: { id: profile.lecturerId },
                data: { role: "lecturer" },
            });
            return { message: "Approved successfully!" };
        });
    }
    catch (error) {
        throw error;
    }
};
const rejectRequest = async (id) => {
    try {
        const profile = await prisma.lecturerProfile.findUnique({
            where: { id, isDestroyed: false },
        });
        if (!profile) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Lecturer profile not found!");
        }
        await prisma.lecturerProfile.update({
            where: { id },
            data: { isDestroyed: true },
        });
        return { message: "Rejected successfully!" };
    }
    catch (error) {
        throw error;
    }
};
export const adminInstructorService = {
    getAllRequests,
    approveRequest,
    rejectRequest,
};
//# sourceMappingURL=adminInstructorService.js.map