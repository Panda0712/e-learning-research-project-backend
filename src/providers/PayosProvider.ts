import { env } from "@/configs/environment.js";
import { PayOS } from "@payos/node";

// Initialize PayOS with options object
const payos = new PayOS({
  clientId: env.PAYOS_CLIENT_ID!,
  apiKey: env.PAYOS_API_KEY!,
  checksumKey: env.PAYOS_CHECKSUM_KEY!,
});

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

export const PayosProvider = {
  /**
   * Create payment link with PayOS
   */
  async createPaymentLink(data: CreatePaymentLinkData) {
    try {
      const paymentLinkData: any = {
        orderCode: data.orderCode,
        amount: data.amount,
        description: data.description,
        buyerName: data.buyerName,
        buyerEmail: data.buyerEmail,
        cancelUrl: data.cancelUrl,
        returnUrl: data.returnUrl,
        expiredAt: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutes from now
      };

      // Only add buyerPhone if it exists (handle optional field)
      if (data.buyerPhone) {
        paymentLinkData.buyerPhone = data.buyerPhone;
      }

      const result = await payos.paymentRequests.create(paymentLinkData);

      return {
        paymentLinkId: result.paymentLinkId,
        checkoutUrl: result.checkoutUrl,
        qrCode: result.qrCode,
        createDate: new Date().toISOString(),
      };
    } catch (error: any) {
      throw new Error(`Failed to create payment link: ${error.message}`);
    }
  },

  /**
   * Get payment link details by order code
   */
  async getPaymentLinkInfo(orderCode: number) {
    try {
      const result = await payos.paymentRequests.get(orderCode);
      return result;
    } catch (error: any) {
      throw new Error(`Failed to get payment link info: ${error.message}`);
    }
  },

  /**
   * Cancel payment link
   */
  async cancelPaymentLink(orderCode: number) {
    try {
      const result = await payos.paymentRequests.cancel(orderCode);
      return result;
    } catch (error: any) {
      throw new Error(`Failed to cancel payment link: ${error.message}`);
    }
  },

  /**
   * Verify webhook signature
   * This is critical for security - ensures webhook is from PayOS
   */
  verifyWebhookSignature(webhookBody: any): boolean {
    try {
      const signature = webhookBody.signature;
      const body = webhookBody.data;

      // Create the string to be hashed
      let strToHash = `${body.orderCode}${body.amount}${body.description}${body.buyerName}${body.buyerEmail}${body.buyerPhone}${body.cancelUrl}${body.returnUrl}`;

      // If webhook has payment response, include it
      if (webhookBody.data && webhookBody.data.status) {
        strToHash = `${body.orderCode}${body.amount}${body.amountPaid}${body.transactionDateTime}${body.status}`;
      }

      // Verify signature
      const crypto = require("crypto");
      const hash = crypto
        .createHmac("sha256", env.PAYOS_CHECKSUM_KEY!)
        .update(strToHash)
        .digest("hex");

      return hash === signature;
    } catch (error) {
      console.error("Webhook verification error:", error);
      return false;
    }
  },

  /**
   * Extract webhook data safely
   */
  extractWebhookData(webhookBody: any): WebhookData | null {
    try {
      return {
        code: webhookBody.code,
        desc: webhookBody.desc,
        data: webhookBody.data,
        signature: webhookBody.signature,
      };
    } catch (error) {
      console.error("Failed to extract webhook data:", error);
      return null;
    }
  },
};
