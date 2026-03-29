import SibApiV3Sdk from "@getbrevo/brevo";
interface SendEmailParams {
    recipientEmail: string;
    subject: string;
    htmlContent: string;
}
export declare const BrevoProvider: {
    sendEmail: ({ recipientEmail, subject, htmlContent, }: SendEmailParams) => Promise<{
        response: import("http").IncomingMessage;
        body: SibApiV3Sdk.CreateSmtpEmail;
    }>;
};
export {};
//# sourceMappingURL=BrevoProvider.d.ts.map