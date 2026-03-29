export declare const orderItemService: {
    addItemToOrder: (data: {
        orderId: number;
        courseId: number;
        price: number;
        lecturerId?: number;
    }) => Promise<{
        course: {
            id: number;
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
        order: {
            status: string | null;
            createdAt: Date;
            updatedAt: Date | null;
            isDestroyed: boolean;
            id: number;
            lecturer: string | null;
            studentId: number;
            totalPrice: number | null;
            paymentMethod: string | null;
            paymentLinkId: string | null;
            paymentStatus: string | null;
            checkoutUrl: string | null;
            qrCode: string | null;
            isSuccess: boolean;
        };
    } & {
        createdAt: Date;
        isDestroyed: boolean;
        id: number;
        courseId: number;
        lecturerId: number | null;
        price: number | null;
        orderId: number;
    }>;
    getOrderItemsByOrderId: (orderId: number) => Promise<({
        course: {
            level: string | null;
            id: number;
            name: string;
            lecturerName: string | null;
            duration: string | null;
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
        isDestroyed: boolean;
        id: number;
        courseId: number;
        lecturerId: number | null;
        price: number | null;
        orderId: number;
    })[]>;
    getOrderItemById: (itemId: number) => Promise<{
        course: {
            level: string | null;
            id: number;
            name: string;
            lecturerName: string | null;
            duration: string | null;
            overview: string | null;
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
        order: {
            status: string | null;
            createdAt: Date;
            id: number;
            studentId: number;
            totalPrice: number | null;
        };
    } & {
        createdAt: Date;
        isDestroyed: boolean;
        id: number;
        courseId: number;
        lecturerId: number | null;
        price: number | null;
        orderId: number;
    }>;
    removeItemFromOrder: (itemId: number) => Promise<{
        course: {
            id: number;
            name: string;
            price: number;
        };
        order: {
            status: string | null;
            createdAt: Date;
            updatedAt: Date | null;
            isDestroyed: boolean;
            id: number;
            lecturer: string | null;
            studentId: number;
            totalPrice: number | null;
            paymentMethod: string | null;
            paymentLinkId: string | null;
            paymentStatus: string | null;
            checkoutUrl: string | null;
            qrCode: string | null;
            isSuccess: boolean;
        };
    } & {
        createdAt: Date;
        isDestroyed: boolean;
        id: number;
        courseId: number;
        lecturerId: number | null;
        price: number | null;
        orderId: number;
    }>;
    updateOrderItem: (itemId: number, data: {
        price?: number;
        lecturerId?: number;
    }) => Promise<{
        course: {
            id: number;
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
        order: {
            status: string | null;
            createdAt: Date;
            updatedAt: Date | null;
            isDestroyed: boolean;
            id: number;
            lecturer: string | null;
            studentId: number;
            totalPrice: number | null;
            paymentMethod: string | null;
            paymentLinkId: string | null;
            paymentStatus: string | null;
            checkoutUrl: string | null;
            qrCode: string | null;
            isSuccess: boolean;
        };
    } & {
        createdAt: Date;
        isDestroyed: boolean;
        id: number;
        courseId: number;
        lecturerId: number | null;
        price: number | null;
        orderId: number;
    }>;
    deleteOrderItem: (itemId: number) => Promise<{
        message: string;
    }>;
    getCommissionsByLecturerAndCourseId: (lecturerId: number, courseId: number, query: {
        page: number;
        limit: number;
        q: string;
        period: string;
    }) => Promise<{
        summary: {
            totalCommission: number;
            received: number;
            pending: number;
        };
        data: {
            id: number;
            customerName: string;
            date: Date;
            status: string;
            price: number;
            commission: number;
        }[];
    }>;
};
//# sourceMappingURL=orderItemService.d.ts.map