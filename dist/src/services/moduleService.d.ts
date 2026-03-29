import { CreateModule, UpdateModule } from "@/types/module.type.js";
export declare const moduleService: {
    createModule: (data: CreateModule) => Promise<{
        title: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        courseId: number;
        duration: string | null;
        totalLessons: number;
        description: string | null;
    }>;
    updateModule: (id: number, updateData: UpdateModule) => Promise<{
        title: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        courseId: number;
        duration: string | null;
        totalLessons: number;
        description: string | null;
    }>;
    deleteModule: (id: number) => Promise<{
        title: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        courseId: number;
        duration: string | null;
        totalLessons: number;
        description: string | null;
    }>;
    getModuleById: (id: number) => Promise<{
        title: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        courseId: number;
        duration: string | null;
        totalLessons: number;
        description: string | null;
    }>;
    getAllModulesByCourseId: (courseId: number, actorId?: number) => Promise<{
        title: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        courseId: number;
        duration: string | null;
        totalLessons: number;
        description: string | null;
    }[]>;
};
//# sourceMappingURL=moduleService.d.ts.map