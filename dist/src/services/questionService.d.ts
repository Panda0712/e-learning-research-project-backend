import { CreateQuestion, UpdateQuestion } from "@/types/question.type.js";
export declare const questionService: {
    createQuestion: (data: CreateQuestion) => Promise<{
        type: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        quizId: number;
        question: string;
        options: import("@prisma/client/runtime/client").JsonValue | null;
        correctAnswer: string | null;
        point: number | null;
    }>;
    updateQuestion: (id: number, updateData: UpdateQuestion) => Promise<{
        type: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        quizId: number;
        question: string;
        options: import("@prisma/client/runtime/client").JsonValue | null;
        correctAnswer: string | null;
        point: number | null;
    }>;
    deleteQuestion: (id: number) => Promise<{
        type: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        quizId: number;
        question: string;
        options: import("@prisma/client/runtime/client").JsonValue | null;
        correctAnswer: string | null;
        point: number | null;
    }>;
    getQuestionById: (id: number) => Promise<{
        type: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        quizId: number;
        question: string;
        options: import("@prisma/client/runtime/client").JsonValue | null;
        correctAnswer: string | null;
        point: number | null;
    }>;
    getAllQuestionsByQuizId: (quizId: number) => Promise<{
        type: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        quizId: number;
        question: string;
        options: import("@prisma/client/runtime/client").JsonValue | null;
        correctAnswer: string | null;
        point: number | null;
    }[]>;
};
//# sourceMappingURL=questionService.d.ts.map