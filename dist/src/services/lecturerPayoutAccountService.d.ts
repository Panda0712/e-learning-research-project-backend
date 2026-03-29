export declare const lecturerPayoutAccountService: {
    createLecturerPayoutAccount: (data: {
        lecturerId: number;
        cardType?: string;
        cardNumber?: string;
        cardExpireDate?: Date;
        cardCVV?: number;
        cardHolderName?: string;
        isDefault?: boolean;
    }) => Promise<{
        lecturer: {
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
        lecturerId: number;
        cardType: string | null;
        cardNumber: string | null;
        cardExpireDate: Date | null;
        cardCVV: number | null;
        cardHolderName: string | null;
        isDefault: boolean | null;
    }>;
    getLecturerPayoutAccountById: (id: number) => Promise<{
        lecturer: {
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
        lecturerId: number;
        cardType: string | null;
        cardNumber: string | null;
        cardExpireDate: Date | null;
        cardCVV: number | null;
        cardHolderName: string | null;
        isDefault: boolean | null;
    }>;
    getAllLecturerPayoutAccounts: (params: {
        page?: number;
        limit?: number;
        lecturerId?: number;
    }) => Promise<{
        data: ({
            lecturer: {
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
            lecturerId: number;
            cardType: string | null;
            cardNumber: string | null;
            cardExpireDate: Date | null;
            cardCVV: number | null;
            cardHolderName: string | null;
            isDefault: boolean | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getPayoutAccountsByLecturerId: (params: {
        lecturerId: number;
        page?: number;
        limit?: number;
    }) => Promise<{
        data: ({
            lecturer: {
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
            lecturerId: number;
            cardType: string | null;
            cardNumber: string | null;
            cardExpireDate: Date | null;
            cardCVV: number | null;
            cardHolderName: string | null;
            isDefault: boolean | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getDefaultPayoutAccount: (lecturerId: number) => Promise<{
        lecturer: {
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
        lecturerId: number;
        cardType: string | null;
        cardNumber: string | null;
        cardExpireDate: Date | null;
        cardCVV: number | null;
        cardHolderName: string | null;
        isDefault: boolean | null;
    }>;
    updateLecturerPayoutAccount: (id: number, data: {
        cardType?: string;
        cardNumber?: string;
        cardExpireDate?: Date;
        cardCVV?: number;
        cardHolderName?: string;
        isDefault?: boolean;
    }) => Promise<{
        lecturer: {
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
        lecturerId: number;
        cardType: string | null;
        cardNumber: string | null;
        cardExpireDate: Date | null;
        cardCVV: number | null;
        cardHolderName: string | null;
        isDefault: boolean | null;
    }>;
    setDefaultPayoutAccount: (id: number, lecturerId: number) => Promise<{
        lecturer: {
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
        lecturerId: number;
        cardType: string | null;
        cardNumber: string | null;
        cardExpireDate: Date | null;
        cardCVV: number | null;
        cardHolderName: string | null;
        isDefault: boolean | null;
    }>;
    deleteLecturerPayoutAccount: (id: number) => Promise<{
        message: string;
    }>;
};
//# sourceMappingURL=lecturerPayoutAccountService.d.ts.map