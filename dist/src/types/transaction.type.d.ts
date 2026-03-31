export type TransactionItem = {
    courseId: number | null;
    courseTitle: string;
    instructorName: string;
    discountAmount: number | null;
    discountCode: string | null;
};
export type Transaction = {
    id: number;
    userId: number;
    userEmail: string | undefined;
    userFullName: string;
    amount: number | null;
    paymentMethod: string | null;
    status: string | null;
    gatewayReference: string | null;
    createdAt: Date;
    items: TransactionItem[];
};
//# sourceMappingURL=transaction.type.d.ts.map