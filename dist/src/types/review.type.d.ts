export interface MapReview {
    id: number;
    courseId: number;
    studentId: number;
    student: {
        firstName?: string | null;
        lastName?: string | null;
        avatar?: {
            fileUrl?: string | null;
        } | null;
    };
    course: {
        name?: string | null;
    };
    content?: string | null;
    studentName?: string | null;
    studentAvatar?: string | null;
    rating: number;
    createdAt: Date;
    updatedAt?: Date;
    isDestroyed: boolean;
}
//# sourceMappingURL=review.type.d.ts.map