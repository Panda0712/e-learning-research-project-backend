export declare const orderService: {
    createOrder: (data: {
        studentId: number;
        paymentMethod?: string;
        couponCode?: string;
        items?: Array<{
            courseId: number;
            quantity: number;
            price: number;
        }>;
    }) => Promise<{
        student: {
            id: number;
            email: string;
            firstName: string | null;
            lastName: string | null;
        };
        items: ({
            course: {
                level: string | null;
                status: string;
                createdAt: Date;
                updatedAt: Date | null;
                isDestroyed: boolean;
                id: number;
                name: string;
                lecturerId: number;
                categoryId: number | null;
                thumbnailId: number | null;
                lecturerName: string | null;
                duration: string | null;
                totalStudents: number;
                totalLessons: number;
                totalQuizzes: number;
                overview: string | null;
                price: number;
            };
        } & {
            createdAt: Date;
            isDestroyed: boolean;
            id: number;
            courseId: number;
            lecturerId: number | null;
            price: number | null;
            orderId: number;
        })[];
    } & {
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
    }>;
    getOrderById: (orderId: number) => Promise<{
        student: {
            id: number;
            email: string;
            firstName: string | null;
            lastName: string | null;
        };
        items: ({
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
        } & {
            createdAt: Date;
            isDestroyed: boolean;
            id: number;
            courseId: number;
            lecturerId: number | null;
            price: number | null;
            orderId: number;
        })[];
    } & {
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
    }>;
    getOrdersByStudentId: (filters: {
        studentId: number;
        page?: number;
        limit?: number;
    }) => Promise<{
        data: ({
            items: ({
                course: {
                    id: number;
                    name: string;
                    price: number;
                };
            } & {
                createdAt: Date;
                isDestroyed: boolean;
                id: number;
                courseId: number;
                lecturerId: number | null;
                price: number | null;
                orderId: number;
            })[];
        } & {
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
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getAllOrders: (filters: {
        page?: number;
        limit?: number;
        status?: string;
    }) => Promise<{
        data: ({
            student: {
                id: number;
                email: string;
                firstName: string | null;
                lastName: string | null;
            };
            items: ({
                course: {
                    id: number;
                    name: string;
                    price: number;
                };
            } & {
                createdAt: Date;
                isDestroyed: boolean;
                id: number;
                courseId: number;
                lecturerId: number | null;
                price: number | null;
                orderId: number;
            })[];
        } & {
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
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    updateOrderStatus: (orderId: number, newStatus: string) => Promise<{
        items: ({
            course: {
                level: string | null;
                status: string;
                createdAt: Date;
                updatedAt: Date | null;
                isDestroyed: boolean;
                id: number;
                name: string;
                lecturerId: number;
                categoryId: number | null;
                thumbnailId: number | null;
                lecturerName: string | null;
                duration: string | null;
                totalStudents: number;
                totalLessons: number;
                totalQuizzes: number;
                overview: string | null;
                price: number;
            };
        } & {
            createdAt: Date;
            isDestroyed: boolean;
            id: number;
            courseId: number;
            lecturerId: number | null;
            price: number | null;
            orderId: number;
        })[];
    } & {
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
    }>;
    cancelOrder: (orderId: number) => Promise<{
        message: string;
    }>;
    deleteOrder: (orderId: number) => Promise<{
        message: string;
    }>;
};
//# sourceMappingURL=orderService.d.ts.map