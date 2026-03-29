export declare const lecturerPayoutService: {
    createLecturerPayout: (data: {
        transactionId?: number;
        lecturerId: number;
        payoutAccountId?: number;
        currency?: string;
        amount?: number;
        payoutMethod?: string;
        status?: string;
    }) => Promise<{
        lecturer: {
            id: number;
            email: string;
            firstName: string | null;
            lastName: string | null;
        };
    } & {
        status: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        lecturerId: number;
        transactionId: number | null;
        payoutAccountId: number | null;
        currency: string | null;
        amount: number | null;
        payoutMethod: string | null;
    }>;
    getLecturerPayoutById: (id: number) => Promise<{
        lecturer: {
            id: number;
            email: string;
            firstName: string | null;
            lastName: string | null;
        };
    } & {
        status: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        lecturerId: number;
        transactionId: number | null;
        payoutAccountId: number | null;
        currency: string | null;
        amount: number | null;
        payoutMethod: string | null;
    }>;
    getAllLecturerPayouts: (params: {
        page?: number;
        limit?: number;
        lecturerId?: number;
        status?: string;
    }) => Promise<{
        data: ({
            lecturer: {
                id: number;
                email: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            status: string;
            createdAt: Date;
            updatedAt: Date | null;
            isDestroyed: boolean;
            id: number;
            lecturerId: number;
            transactionId: number | null;
            payoutAccountId: number | null;
            currency: string | null;
            amount: number | null;
            payoutMethod: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getPayoutsByLecturerId: (params: {
        lecturerId: number;
        page?: number;
        limit?: number;
        status?: string;
    }) => Promise<{
        data: ({
            lecturer: {
                id: number;
                email: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            status: string;
            createdAt: Date;
            updatedAt: Date | null;
            isDestroyed: boolean;
            id: number;
            lecturerId: number;
            transactionId: number | null;
            payoutAccountId: number | null;
            currency: string | null;
            amount: number | null;
            payoutMethod: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    updateLecturerPayout: (id: number, data: {
        transactionId?: number;
        payoutAccountId?: number;
        currency?: string;
        amount?: number;
        payoutMethod?: string;
        status?: string;
    }) => Promise<{
        lecturer: {
            id: number;
            email: string;
            firstName: string | null;
            lastName: string | null;
        };
    } & {
        status: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        lecturerId: number;
        transactionId: number | null;
        payoutAccountId: number | null;
        currency: string | null;
        amount: number | null;
        payoutMethod: string | null;
    }>;
    updatePayoutStatus: (id: number, status: string) => Promise<{
        lecturer: {
            id: number;
            email: string;
            firstName: string | null;
            lastName: string | null;
        };
    } & {
        status: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        lecturerId: number;
        transactionId: number | null;
        payoutAccountId: number | null;
        currency: string | null;
        amount: number | null;
        payoutMethod: string | null;
    }>;
    deleteLecturerPayout: (id: number) => Promise<{
        message: string;
    }>;
};
//# sourceMappingURL=lecturerPayoutService.d.ts.map