export declare const wishlistService: {
    createWishlist: (data: {
        userId: number;
        courseId: number;
        courseThumbnail?: string;
        courseName?: string;
        lecturer?: string;
    }) => Promise<{
        user: {
            id: number;
            email: string;
            firstName: string | null;
            lastName: string | null;
        };
    } & {
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        courseId: number;
        lecturer: string | null;
        courseThumbnail: string | null;
        userId: number;
        courseName: string | null;
    }>;
    getWishlistById: (id: number) => Promise<{
        user: {
            id: number;
            email: string;
            firstName: string | null;
            lastName: string | null;
        };
    } & {
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        courseId: number;
        lecturer: string | null;
        courseThumbnail: string | null;
        userId: number;
        courseName: string | null;
    }>;
    getAllWishlists: (params: {
        page?: number;
        limit?: number;
        userId?: number;
    }) => Promise<{
        data: ({
            user: {
                id: number;
                email: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            createdAt: Date;
            updatedAt: Date | null;
            isDestroyed: boolean;
            id: number;
            courseId: number;
            lecturer: string | null;
            courseThumbnail: string | null;
            userId: number;
            courseName: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getWishlistsByUserId: (params: {
        userId: number;
        page?: number;
        limit?: number;
    }) => Promise<{
        data: ({
            user: {
                id: number;
                email: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            createdAt: Date;
            updatedAt: Date | null;
            isDestroyed: boolean;
            id: number;
            courseId: number;
            lecturer: string | null;
            courseThumbnail: string | null;
            userId: number;
            courseName: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    checkCourseInWishlist: (userId: number, courseId: number) => Promise<{
        inWishlist: boolean;
        wishlistId: number | null;
    }>;
    updateWishlist: (id: number, data: {
        courseThumbnail?: string;
        courseName?: string;
        lecturer?: string;
    }) => Promise<{
        user: {
            id: number;
            email: string;
            firstName: string | null;
            lastName: string | null;
        };
    } & {
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        courseId: number;
        lecturer: string | null;
        courseThumbnail: string | null;
        userId: number;
        courseName: string | null;
    }>;
    deleteWishlist: (id: number) => Promise<{
        message: string;
    }>;
    deleteWishlistByCourse: (userId: number, courseId: number) => Promise<{
        message: string;
    }>;
};
//# sourceMappingURL=wishlistService.d.ts.map