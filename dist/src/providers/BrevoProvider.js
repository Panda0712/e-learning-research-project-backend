import { env } from "@/configs/environment.js";
import SibApiV3Sdk from "@getbrevo/brevo";
const transactionalEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();
transactionalEmailApi.authentications.apiKey.apiKey =
    env.BREVO_API_KEY;
const sendEmail = async ({ recipientEmail, subject, htmlContent, }) => {
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = {
        name: env.ADMIN_EMAIL_NAME || "",
        email: env.ADMIN_EMAIL_ADDRESS || "",
    };
    sendSmtpEmail.to = [{ email: recipientEmail }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    try {
        const response = await transactionalEmailApi.sendTransacEmail(sendSmtpEmail);
        return response;
    }
    catch (error) {
        throw error;
    }
};
export const BrevoProvider = {
    sendEmail,
};
//# sourceMappingURL=BrevoProvider.js.map