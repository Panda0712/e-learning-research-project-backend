export declare const adminInstructorService: {
    getAllRequests: () => Promise<({
        lecturer: {
            password: string;
            createdAt: Date;
            updatedAt: Date | null;
            isDestroyed: boolean;
            id: number;
            email: string;
            firstName: string | null;
            lastName: string | null;
            avatarId: number | null;
            phoneNumber: string | null;
            dateOfBirth: Date | null;
            role: string;
            verifyToken: string | null;
            resetPasswordToken: string | null;
            resetPasswordExpires: Date | null;
            isVerified: boolean;
        };
        lecturerFile: {
            createdAt: Date;
            updatedAt: Date | null;
            isDestroyed: boolean;
            id: number;
            publicId: string;
            fileSize: number | null;
            fileType: string | null;
            fileUrl: string;
        } | null;
    } & {
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        lecturerId: number;
        totalStudents: number | null;
        lecturerFileId: number | null;
        gender: string | null;
        nationality: string | null;
        professionalTitle: string | null;
        beginStudies: Date | null;
        highestDegree: string | null;
        totalCourses: number | null;
        avgRating: number | null;
        bio: string | null;
        isActive: boolean;
    })[]>;
    approveRequest: (id: number) => Promise<{
        message: string;
    }>;
    rejectRequest: (id: number) => Promise<{
        message: string;
    }>;
};
//# sourceMappingURL=adminInstructorService.d.ts.map