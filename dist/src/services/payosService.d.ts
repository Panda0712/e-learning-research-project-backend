export declare const payosService: {
    createPaymentLink: (data: {
        orderId: number;
        returnUrl?: string;
        cancelUrl?: string;
    }) => Promise<{
        orderId: number;
        paymentLinkId: any;
        checkoutUrl: any;
        qrCode: any;
        amount: number | null;
    }>;
    handleWebhook: (webhookBody: any) => Promise<{
        success: boolean;
        message: string;
        orderId: number;
        status: string | null;
    } | {
        success: boolean;
        message: string;
        orderId: number;
        status?: never;
    }>;
    checkPaymentStatus: (orderId: number) => Promise<{
        orderId: number;
        status: string | null;
        note: string;
        paymentStatus?: never;
        orderStatus?: never;
        isSuccess?: never;
        totalPrice?: never;
    } | {
        orderId: number | undefined;
        paymentStatus: string | null | undefined;
        orderStatus: string | null | undefined;
        isSuccess: boolean | undefined;
        totalPrice: number | null | undefined;
        status?: never;
        note?: never;
    }>;
    cancelPayment: (orderId: number) => Promise<{
        orderId: number;
        message: string;
        status: string | null;
    }>;
};
//# sourceMappingURL=payosService.d.ts.map