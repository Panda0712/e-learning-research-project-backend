export declare const courseReviewService: {
    createCourseReview: (data: {
        courseId: number;
        studentId: number;
        studentName?: string;
        studentAvatar?: string;
        rating: number;
        content?: string;
    }) => Promise<{
        course: {
            id: number;
            name: string;
        };
        student: {
            id: number;
            email: string;
            firstName: string | null;
            lastName: string | null;
            avatarId: number | null;
        };
    } & {
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        courseId: number;
        studentId: number;
        content: string | null;
        studentName: string | null;
        studentAvatar: string | null;
        rating: number;
    }>;
    getCourseReviewById: (id: number) => Promise<{
        course: {
            id: number;
            name: string;
        };
        student: {
            id: number;
            email: string;
            firstName: string | null;
            lastName: string | null;
            avatarId: number | null;
        };
    } & {
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        courseId: number;
        studentId: number;
        content: string | null;
        studentName: string | null;
        studentAvatar: string | null;
        rating: number;
    }>;
    getAllCourseReviews: (params: {
        page?: number;
        limit?: number;
        courseId?: number;
        studentId?: number;
        rating?: number;
    }) => Promise<{
        data: ({
            course: {
                id: number;
                name: string;
            };
            student: {
                id: number;
                email: string;
                firstName: string | null;
                lastName: string | null;
                avatarId: number | null;
            };
        } & {
            createdAt: Date;
            updatedAt: Date | null;
            isDestroyed: boolean;
            id: number;
            courseId: number;
            studentId: number;
            content: string | null;
            studentName: string | null;
            studentAvatar: string | null;
            rating: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getReviewsByCourseId: (params: {
        courseId: number;
        page?: number;
        limit?: number;
        rating?: number;
    }) => Promise<{
        data: ({
            course: {
                id: number;
                name: string;
            };
            student: {
                id: number;
                email: string;
                firstName: string | null;
                lastName: string | null;
                avatarId: number | null;
            };
        } & {
            createdAt: Date;
            updatedAt: Date | null;
            isDestroyed: boolean;
            id: number;
            courseId: number;
            studentId: number;
            content: string | null;
            studentName: string | null;
            studentAvatar: string | null;
            rating: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        statistics: {
            totalReviews: number;
            oneStar: number;
            twoStar: number;
            threeStar: number;
            fourStar: number;
            fiveStar: number;
            averageRating: number;
        };
    }>;
    getReviewsByStudentId: (params: {
        studentId: number;
        page?: number;
        limit?: number;
    }) => Promise<{
        data: ({
            course: {
                id: number;
                name: string;
            };
            student: {
                id: number;
                email: string;
                firstName: string | null;
                lastName: string | null;
                avatarId: number | null;
            };
        } & {
            createdAt: Date;
            updatedAt: Date | null;
            isDestroyed: boolean;
            id: number;
            courseId: number;
            studentId: number;
            content: string | null;
            studentName: string | null;
            studentAvatar: string | null;
            rating: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    updateCourseReview: (id: number, data: {
        rating?: number;
        content?: string;
    }) => Promise<{
        course: {
            id: number;
            name: string;
        };
        student: {
            id: number;
            email: string;
            firstName: string | null;
            lastName: string | null;
            avatarId: number | null;
        };
    } & {
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        courseId: number;
        studentId: number;
        content: string | null;
        studentName: string | null;
        studentAvatar: string | null;
        rating: number;
    }>;
    deleteCourseReview: (id: number) => Promise<{
        message: string;
    }>;
};
//# sourceMappingURL=courseReviewService.d.ts.map