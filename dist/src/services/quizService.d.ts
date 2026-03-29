import { CreateQuiz, UpdateQuiz } from "@/types/quiz.type.js";
export declare const quizService: {
    createQuiz: (data: CreateQuiz) => Promise<{
        title: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        lessonId: number;
        description: string | null;
        timeLimit: number | null;
        passingScore: number | null;
    }>;
    updateQuiz: (id: number, updateData: UpdateQuiz) => Promise<{
        title: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        lessonId: number;
        description: string | null;
        timeLimit: number | null;
        passingScore: number | null;
    }>;
    deleteQuiz: (id: number) => Promise<{
        title: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        lessonId: number;
        description: string | null;
        timeLimit: number | null;
        passingScore: number | null;
    }>;
    getQuizById: (id: number) => Promise<{
        title: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        lessonId: number;
        description: string | null;
        timeLimit: number | null;
        passingScore: number | null;
    }>;
    getAllQuizzesByLessonId: (lessonId: number) => Promise<{
        title: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        lessonId: number;
        description: string | null;
        timeLimit: number | null;
        passingScore: number | null;
    }[]>;
};
//# sourceMappingURL=quizService.d.ts.map