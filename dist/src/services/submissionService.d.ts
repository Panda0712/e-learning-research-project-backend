export declare const submissionService: {
    createSubmission: (data: {
        assessmentId: number;
        quizId: number;
        studentId: number;
        score?: number;
        status?: string;
        feedback?: string;
        submittedAt?: Date;
    }) => Promise<{
        quiz: {
            title: string;
            id: number;
        };
        assessment: {
            title: string;
            id: number;
        };
        student: {
            id: number;
            email: string;
            firstName: string | null;
            lastName: string | null;
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
    }>;
    getSubmissionById: (id: number) => Promise<{
        quiz: {
            title: string;
            id: number;
        };
        assessment: {
            title: string;
            id: number;
        };
        student: {
            id: number;
            email: string;
            firstName: string | null;
            lastName: string | null;
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
    }>;
    getAllSubmissions: (params: {
        page?: number;
        limit?: number;
        studentId?: number;
        assessmentId?: number;
        quizId?: number;
        status?: string;
    }) => Promise<{
        data: ({
            quiz: {
                title: string;
                id: number;
            };
            assessment: {
                title: string;
                id: number;
            };
            student: {
                id: number;
                email: string;
                firstName: string | null;
                lastName: string | null;
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
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getSubmissionsByStudentId: (params: {
        studentId: number;
        page?: number;
        limit?: number;
        status?: string;
    }) => Promise<{
        data: ({
            quiz: {
                title: string;
                id: number;
            };
            assessment: {
                title: string;
                id: number;
            };
            student: {
                id: number;
                email: string;
                firstName: string | null;
                lastName: string | null;
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
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    updateSubmission: (id: number, data: {
        score?: number;
        status?: string;
        feedback?: string;
        submittedAt?: Date;
    }) => Promise<{
        quiz: {
            title: string;
            id: number;
        };
        assessment: {
            title: string;
            id: number;
        };
        student: {
            id: number;
            email: string;
            firstName: string | null;
            lastName: string | null;
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
    }>;
    gradeSubmission: (id: number, data: {
        score: number;
        feedback?: string;
        status?: string;
    }) => Promise<{
        quiz: {
            title: string;
            id: number;
        };
        assessment: {
            title: string;
            id: number;
        };
        student: {
            id: number;
            email: string;
            firstName: string | null;
            lastName: string | null;
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
    }>;
    deleteSubmission: (id: number) => Promise<{
        message: string;
    }>;
};
//# sourceMappingURL=submissionService.d.ts.map