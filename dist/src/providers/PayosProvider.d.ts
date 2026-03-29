interface CreatePaymentLinkData {
    orderCode: number;
    amount: number;
    description: string;
    buyerName: string;
    buyerEmail: string;
    buyerPhone?: string;
    cancelUrl: string;
    returnUrl: string;
}
interface WebhookData {
    code: string;
    desc: string;
    data: {
        orderCode: number;
        orderCodeV2: string;
        amount: number;
        amountPaid: number;
        amountRemaining: number;
        transactionDateTime: string;
        status: string;
        createdAt: string;
        canceledAt?: string;
    };
    signature: string;
}
export declare const PayosProvider: {
    /**
     * Create payment link with PayOS
     */
    createPaymentLink(data: CreatePaymentLinkData): Promise<{
        paymentLinkId: any;
        checkoutUrl: any;
        qrCode: any;
        createDate: string;
    }>;
    /**
     * Get payment link details by order code
     */
    getPaymentLinkInfo(orderCode: number): Promise<any>;
    /**
     * Cancel payment link
     */
    cancelPaymentLink(orderCode: number): Promise<any>;
    /**
     * Verify webhook signature
     * This is critical for security - ensures webhook is from PayOS
     */
    verifyWebhookSignature(webhookBody: any): boolean;
    /**
     * Extract webhook data safely
     */
    extractWebhookData(webhookBody: any): WebhookData | null;
};
export {};
//# sourceMappingURL=PayosProvider.d.ts.map