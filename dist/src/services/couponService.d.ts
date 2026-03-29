export declare const couponService: {
    createCouponCategory: (data: {
        name: string;
        slug: string;
    }) => Promise<{
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        name: string;
        slug: string;
    }>;
    getAllCouponCategories: () => Promise<({
        coupons: {
            type: string | null;
            status: string | null;
            createdAt: Date;
            updatedAt: Date | null;
            isDestroyed: boolean;
            id: number;
            courseId: number | null;
            name: string;
            categoryId: number | null;
            description: string | null;
            amount: number | null;
            customerGroup: string | null;
            code: string;
            quantity: number | null;
            usesPerCustomer: number | null;
            priority: string | null;
            actions: string | null;
            startingDate: Date | null;
            startingTime: string | null;
            endingDate: Date | null;
            endingTime: string | null;
            isUnlimited: boolean | null;
        }[];
    } & {
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        name: string;
        slug: string;
    })[]>;
    getCouponCategoryById: (id: number) => Promise<{
        coupons: {
            type: string | null;
            status: string | null;
            createdAt: Date;
            updatedAt: Date | null;
            isDestroyed: boolean;
            id: number;
            courseId: number | null;
            name: string;
            categoryId: number | null;
            description: string | null;
            amount: number | null;
            customerGroup: string | null;
            code: string;
            quantity: number | null;
            usesPerCustomer: number | null;
            priority: string | null;
            actions: string | null;
            startingDate: Date | null;
            startingTime: string | null;
            endingDate: Date | null;
            endingTime: string | null;
            isUnlimited: boolean | null;
        }[];
    } & {
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        name: string;
        slug: string;
    }>;
    updateCouponCategory: (id: number, data: {
        name?: string;
        slug?: string;
    }) => Promise<{
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        name: string;
        slug: string;
    }>;
    deleteCouponCategory: (id: number) => Promise<{
        message: string;
    }>;
    createCoupon: (data: any) => Promise<{
        category: {
            createdAt: Date;
            updatedAt: Date | null;
            isDestroyed: boolean;
            id: number;
            name: string;
            slug: string;
        } | null;
    } & {
        type: string | null;
        status: string | null;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        courseId: number | null;
        name: string;
        categoryId: number | null;
        description: string | null;
        amount: number | null;
        customerGroup: string | null;
        code: string;
        quantity: number | null;
        usesPerCustomer: number | null;
        priority: string | null;
        actions: string | null;
        startingDate: Date | null;
        startingTime: string | null;
        endingDate: Date | null;
        endingTime: string | null;
        isUnlimited: boolean | null;
    }>;
    getAllCoupons: (filters: {
        page?: number;
        limit?: number;
        status?: string;
        courseId?: number;
    }) => Promise<{
        data: {
            redemptions: number;
            category: {
                createdAt: Date;
                updatedAt: Date | null;
                isDestroyed: boolean;
                id: number;
                name: string;
                slug: string;
            } | null;
            type: string | null;
            status: string | null;
            createdAt: Date;
            updatedAt: Date | null;
            isDestroyed: boolean;
            id: number;
            courseId: number | null;
            name: string;
            categoryId: number | null;
            description: string | null;
            amount: number | null;
            customerGroup: string | null;
            code: string;
            quantity: number | null;
            usesPerCustomer: number | null;
            priority: string | null;
            actions: string | null;
            startingDate: Date | null;
            startingTime: string | null;
            endingDate: Date | null;
            endingTime: string | null;
            isUnlimited: boolean | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getCouponById: (id: number) => Promise<{
        category: {
            createdAt: Date;
            updatedAt: Date | null;
            isDestroyed: boolean;
            id: number;
            name: string;
            slug: string;
        } | null;
    } & {
        type: string | null;
        status: string | null;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        courseId: number | null;
        name: string;
        categoryId: number | null;
        description: string | null;
        amount: number | null;
        customerGroup: string | null;
        code: string;
        quantity: number | null;
        usesPerCustomer: number | null;
        priority: string | null;
        actions: string | null;
        startingDate: Date | null;
        startingTime: string | null;
        endingDate: Date | null;
        endingTime: string | null;
        isUnlimited: boolean | null;
    }>;
    getCouponByCode: (code: string) => Promise<{
        category: {
            createdAt: Date;
            updatedAt: Date | null;
            isDestroyed: boolean;
            id: number;
            name: string;
            slug: string;
        } | null;
    } & {
        type: string | null;
        status: string | null;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        courseId: number | null;
        name: string;
        categoryId: number | null;
        description: string | null;
        amount: number | null;
        customerGroup: string | null;
        code: string;
        quantity: number | null;
        usesPerCustomer: number | null;
        priority: string | null;
        actions: string | null;
        startingDate: Date | null;
        startingTime: string | null;
        endingDate: Date | null;
        endingTime: string | null;
        isUnlimited: boolean | null;
    }>;
    updateCoupon: (id: number, data: any) => Promise<{
        category: {
            createdAt: Date;
            updatedAt: Date | null;
            isDestroyed: boolean;
            id: number;
            name: string;
            slug: string;
        } | null;
    } & {
        type: string | null;
        status: string | null;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        courseId: number | null;
        name: string;
        categoryId: number | null;
        description: string | null;
        amount: number | null;
        customerGroup: string | null;
        code: string;
        quantity: number | null;
        usesPerCustomer: number | null;
        priority: string | null;
        actions: string | null;
        startingDate: Date | null;
        startingTime: string | null;
        endingDate: Date | null;
        endingTime: string | null;
        isUnlimited: boolean | null;
    }>;
    deleteCoupon: (id: number) => Promise<{
        message: string;
    }>;
    verifyCouponCode: (code: string) => Promise<{
        isValid: boolean;
        coupon: {
            category: {
                createdAt: Date;
                updatedAt: Date | null;
                isDestroyed: boolean;
                id: number;
                name: string;
                slug: string;
            } | null;
        } & {
            type: string | null;
            status: string | null;
            createdAt: Date;
            updatedAt: Date | null;
            isDestroyed: boolean;
            id: number;
            courseId: number | null;
            name: string;
            categoryId: number | null;
            description: string | null;
            amount: number | null;
            customerGroup: string | null;
            code: string;
            quantity: number | null;
            usesPerCustomer: number | null;
            priority: string | null;
            actions: string | null;
            startingDate: Date | null;
            startingTime: string | null;
            endingDate: Date | null;
            endingTime: string | null;
            isUnlimited: boolean | null;
        };
        message: string;
    }>;
};
//# sourceMappingURL=couponService.d.ts.map