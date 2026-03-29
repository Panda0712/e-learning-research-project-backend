export declare const enrollmentService: {
    createEnrollment: (data: {
        studentId: number;
        courseId: number;
    }) => Promise<{
        status: string;
        createdAt: Date;
        isDestroyed: boolean;
        id: number;
        courseId: number;
        studentId: number;
        progress: number;
        lastAccessedAt: Date | null;
    }>;
    getEnrollmentsByStudentId: (studentId: number) => Promise<({
        course: {
            level: string | null;
            status: string;
            createdAt: Date;
            updatedAt: Date | null;
            isDestroyed: boolean;
            id: number;
            name: string;
            lecturerId: number;
            categoryId: number | null;
            thumbnailId: number | null;
            lecturerName: string | null;
            duration: string | null;
            totalStudents: number;
            totalLessons: number;
            totalQuizzes: number;
            overview: string | null;
            price: number;
        };
    } & {
        status: string;
        createdAt: Date;
        isDestroyed: boolean;
        id: number;
        courseId: number;
        studentId: number;
        progress: number;
        lastAccessedAt: Date | null;
    })[]>;
    getStudentsByLecturerId: (lecturerId: number) => Promise<({
        course: {
            level: string | null;
            status: string;
            createdAt: Date;
            updatedAt: Date | null;
            isDestroyed: boolean;
            id: number;
            name: string;
            lecturerId: number;
            categoryId: number | null;
            thumbnailId: number | null;
            lecturerName: string | null;
            duration: string | null;
            totalStudents: number;
            totalLessons: number;
            totalQuizzes: number;
            overview: string | null;
            price: number;
        };
        student: {
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
    } & {
        status: string;
        createdAt: Date;
        isDestroyed: boolean;
        id: number;
        courseId: number;
        studentId: number;
        progress: number;
        lastAccessedAt: Date | null;
    })[]>;
    getStudentsByLecturerIdAndCourseId: (lecturerId: number, courseId: number) => Promise<{
        id: number;
        name: string;
        country: string;
        joinedDate: Date;
        progress: number;
    }[]>;
};
//# sourceMappingURL=enrollmentService.d.ts.map