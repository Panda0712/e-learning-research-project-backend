export declare const assessmentService: {
    createAssessment: (data: any) => Promise<{
        title: string;
        type: string | null;
        dueDate: Date | null;
        status: string | null;
        totalSubmissions: number | null;
        averageScore: number | null;
        createdAt: Date;
        updatedAt: Date;
        isDestroyed: boolean;
        id: number;
        courseId: number;
        lessonId: number | null;
    }>;
    getAssessmentsForLecturer: (lecturerId: number) => Promise<{
        id: number;
        title: string;
        courseName: string;
        submissionsText: string;
        status: string;
        dueDate: Date | null;
        averageScore: number;
        totalSubmissions: number;
        type: string | null;
        lessonId: number | null;
        isDestroyed: boolean;
        courseId: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getAssessmentById: (id: number) => Promise<{
        title: string;
        type: string | null;
        dueDate: Date | null;
        status: string | null;
        totalSubmissions: number | null;
        averageScore: number | null;
        createdAt: Date;
        updatedAt: Date;
        isDestroyed: boolean;
        id: number;
        courseId: number;
        lessonId: number | null;
    } | null>;
    getSubmissionsDetail: (assessmentId: number) => Promise<({
        student: {
            id: number;
            firstName: string | null;
            lastName: string | null;
            avatar: {
                createdAt: Date;
                updatedAt: Date | null;
                isDestroyed: boolean;
                id: number;
                publicId: string;
                fileSize: number | null;
                fileType: string | null;
                fileUrl: string;
            } | null;
        };
    } & {
        status: string | null;
        isDestroyed: boolean | null;
        id: number;
        assessmentId: number;
        quizId: number;
        studentId: number;
        score: number | null;
        feedback: string | null;
        submittedAt: Date | null;
    })[]>;
    updateAssessment: (id: number, data: {
        title?: string;
        status?: string;
        dueDate?: Date;
    }) => Promise<{
        title: string;
        type: string | null;
        dueDate: Date | null;
        status: string | null;
        totalSubmissions: number | null;
        averageScore: number | null;
        createdAt: Date;
        updatedAt: Date;
        isDestroyed: boolean;
        id: number;
        courseId: number;
        lessonId: number | null;
    }>;
    updateFeedback: (submissionId: number, feedback: string) => Promise<{
        status: string | null;
        isDestroyed: boolean | null;
        id: number;
        assessmentId: number;
        quizId: number;
        studentId: number;
        score: number | null;
        feedback: string | null;
        submittedAt: Date | null;
    }>;
    deleteAssessment: (id: number) => Promise<{
        title: string;
        type: string | null;
        dueDate: Date | null;
        status: string | null;
        totalSubmissions: number | null;
        averageScore: number | null;
        createdAt: Date;
        updatedAt: Date;
        isDestroyed: boolean;
        id: number;
        courseId: number;
        lessonId: number | null;
    }>;
    updateAssessmentStats: (assessmentId: number) => Promise<void>;
};
//# sourceMappingURL=assessmentService.d.ts.map