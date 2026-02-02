import { env } from "@/configs/environment.js";
import { Resend } from "resend";

const RESEND_API_KEY = env.RESEND_API_KEY;

const ADMIN_SENDER_EMAIL =
  env.RESEND_ADMIN_SENDER_EMAIL || "onboarding@resend.dev";

const resendInstance = new Resend(RESEND_API_KEY);

const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    const data = await resendInstance.emails.send({
      from: ADMIN_SENDER_EMAIL,
      to, // can just send emails to registered email if don't have valid domain
      subject,
      html,
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const ResendProvider = {
  sendEmail,
};
