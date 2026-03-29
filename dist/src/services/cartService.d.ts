export declare const cartService: {
    getCartByUserId: (userId: number) => Promise<({
        items: ({
            course: {
                name: string;
                lecturerName: string | null;
                price: number;
                thumbnail: {
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
            createdAt: Date;
            id: number;
            courseId: number;
            price: number;
            cartId: number;
        })[];
    } & {
        createdAt: Date;
        updatedAt: Date;
        isDestroyed: boolean;
        id: number;
        lecturer: string | null;
        userId: number;
        courseName: string | null;
    }) | {
        items: never[];
    }>;
    addToCart: (reqBody: {
        userId: number;
        courseId: number;
        price: number;
    }) => Promise<{
        createdAt: Date;
        id: number;
        courseId: number;
        price: number;
        cartId: number;
    }>;
    removeItem: (itemId: number) => Promise<{
        message: string;
    }>;
};
//# sourceMappingURL=cartService.d.ts.map