import { CreateLesson, UpdateLesson } from "@/types/lesson.type.js";
export declare const lessonService: {
    createLesson: (data: CreateLesson) => Promise<{
        title: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        duration: string | null;
        lessonFileId: number | null;
        moduleId: number;
        description: string | null;
        note: string | null;
        lessonVideoId: number | null;
    }>;
    updateLesson: (id: number, updateData: UpdateLesson) => Promise<{
        title: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        duration: string | null;
        lessonFileId: number | null;
        moduleId: number;
        description: string | null;
        note: string | null;
        lessonVideoId: number | null;
    }>;
    deleteLesson: (id: number) => Promise<{
        title: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        duration: string | null;
        lessonFileId: number | null;
        moduleId: number;
        description: string | null;
        note: string | null;
        lessonVideoId: number | null;
    }>;
    getLessonById: (id: number) => Promise<{
        title: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        duration: string | null;
        lessonFileId: number | null;
        moduleId: number;
        description: string | null;
        note: string | null;
        lessonVideoId: number | null;
    }>;
    getAllLessonsByModuleId: (moduleId: number, actorId?: number) => Promise<{
        title: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        duration: string | null;
        lessonFileId: number | null;
        moduleId: number;
        description: string | null;
        note: string | null;
        lessonVideoId: number | null;
    }[]>;
    getLessonByResourceId: (resourceId: number) => Promise<{
        title: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        duration: string | null;
        lessonFileId: number | null;
        moduleId: number;
        description: string | null;
        note: string | null;
        lessonVideoId: number | null;
    } | null>;
};
//# sourceMappingURL=lessonService.d.ts.map