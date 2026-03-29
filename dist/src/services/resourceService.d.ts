import { Prisma } from "@/generated/prisma/client.js";
import { CreateResource } from "@/types/resource.type.js";
export declare const resourceService: {
    createResource: (data: CreateResource) => Promise<{
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        publicId: string;
        fileSize: number | null;
        fileType: string | null;
        fileUrl: string;
    }>;
    createResourceWithTransaction: (data: CreateResource, tx: Prisma.TransactionClient) => Promise<{
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        publicId: string;
        fileSize: number | null;
        fileType: string | null;
        fileUrl: string;
    }>;
    getResourceById: (id: number) => Promise<{
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        publicId: string;
        fileSize: number | null;
        fileType: string | null;
        fileUrl: string;
    }>;
    getResourceByPublicId: (publicId: string) => Promise<{
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        publicId: string;
        fileSize: number | null;
        fileType: string | null;
        fileUrl: string;
    }>;
    getLearningResourceById: (resourceId: number, studentId: number) => Promise<{
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        publicId: string;
        fileSize: number | null;
        fileType: string | null;
        fileUrl: string;
    }>;
    getAllResourcesByFileType: (fileType: string) => Promise<{
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        publicId: string;
        fileSize: number | null;
        fileType: string | null;
        fileUrl: string;
    }[]>;
    deleteResource: (id: number) => Promise<{
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        publicId: string;
        fileSize: number | null;
        fileType: string | null;
        fileUrl: string;
    }>;
    deleteResourceWithTransaction: (id: number, tx: Prisma.TransactionClient) => Promise<{
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        publicId: string;
        fileSize: number | null;
        fileType: string | null;
        fileUrl: string;
    }>;
    deleteResourceByPublicId: (publicId: string) => Promise<{
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        publicId: string;
        fileSize: number | null;
        fileType: string | null;
        fileUrl: string;
    }>;
};
//# sourceMappingURL=resourceService.d.ts.map