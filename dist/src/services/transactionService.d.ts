export declare const transactionService: {
    createTransaction: (data: {
        userId: number;
        items: any[];
        paymentMethod: string;
        totalAmount: number;
    }) => Promise<{
        studentTransactions: {
            createdAt: Date;
            isDestroyed: boolean;
            id: number;
            courseId: number | null;
            orderId: number | null;
            transactionId: number;
            discountCode: string | null;
            discountAmount: number | null;
            isDiscount: boolean | null;
        }[];
    } & {
        status: string | null;
        createdAt: Date;
        isDestroyed: boolean;
        id: number;
        paymentMethod: string | null;
        userId: number;
        amount: number | null;
        userRole: string | null;
        gatewayReference: string | null;
    }>;
    getHistoryByUserId: (userId: number) => Promise<({
        studentTransactions: {
            createdAt: Date;
            isDestroyed: boolean;
            id: number;
            courseId: number | null;
            orderId: number | null;
            transactionId: number;
            discountCode: string | null;
            discountAmount: number | null;
            isDiscount: boolean | null;
        }[];
    } & {
        status: string | null;
        createdAt: Date;
        isDestroyed: boolean;
        id: number;
        paymentMethod: string | null;
        userId: number;
        amount: number | null;
        userRole: string | null;
        gatewayReference: string | null;
    })[]>;
    getStudentTransactionsByCourseId: (courseId: number) => Promise<({
        transaction: {
            user: {
                id: number;
                email: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            status: string | null;
            createdAt: Date;
            isDestroyed: boolean;
            id: number;
            paymentMethod: string | null;
            userId: number;
            amount: number | null;
            userRole: string | null;
            gatewayReference: string | null;
        };
    } & {
        createdAt: Date;
        isDestroyed: boolean;
        id: number;
        courseId: number | null;
        orderId: number | null;
        transactionId: number;
        discountCode: string | null;
        discountAmount: number | null;
        isDiscount: boolean | null;
    })[]>;
    getAllTransactions: () => Promise<{
        id: number;
        userId: number;
        userEmail: string;
        userFullName: string;
        amount: number | null;
        paymentMethod: string | null;
        status: string | null;
        gatewayReference: string | null;
        createdAt: Date;
        items: {
            courseId: number | null;
            courseTitle: string;
            instructorName: string;
            discountAmount: number | null;
            discountCode: string | null;
        }[];
    }[]>;
};
//# sourceMappingURL=transactionService.d.ts.map