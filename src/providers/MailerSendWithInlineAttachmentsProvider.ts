import { env } from "@/configs/environment.js";
import fs from "fs";
import {
  Attachment,
  EmailParams,
  MailerSend,
  Recipient,
  Sender,
} from "mailersend";
import { Personalization } from "mailersend/lib/modules/Email.module.js";

const MAILERSEND_API_KEY = env.MAILERSEND_API_KEY || "";
const ADMIN_EMAIL_ADDRESS = "pandadev@test-z0vklo6zrexl7qrx.mlsender.net";
const ADMIN_EMAIL_NAME = env.ADMIN_EMAIL_NAME;

const MailerSendInstance = new MailerSend({ apiKey: MAILERSEND_API_KEY });

const sendFrom = new Sender(ADMIN_EMAIL_ADDRESS, ADMIN_EMAIL_NAME);

const sendEmail = async ({
  to,
  toName,
  subject,
  html,
  templateId,
  personalizationData,
  attachments,
}: {
  to: string;
  toName: string;
  subject: string;
  html: string;
  templateId: string;
  personalizationData: Personalization[];
  attachments: [
    {
      filePath: string;
      fileName: string;
      fileId: string;
      attachmentType: string;
    },
  ];
}) => {
  try {
    const recipients = [new Recipient(to, toName)];

    // CC (Carbon Copy): Gửi bản sao công khai, nghĩa là gửi bản sao của email cho người khác để họ biết nội dung email, nhưng không cần phản hồi.
    // Người nhận chính và người được CC đều thấy email của nhau.
    // const cc = [
    //   new Recipient("your_cc_01@trungquandev.com", "Your Client CC 01"),
    //   new Recipient("your_cc_02@trungquandev.com", "Your Client CC 02"),
    //   new Recipient("your_cc_03@trungquandev.com", "Your Client CC 03"),
    // ];

    // BCC (Blind Carbon Copy): Gửi bản sao ẩn danh, nghĩa là người nhận chính không biết ai đang nhận BCC.
    // BCC rất hữu ích khi gửi email hàng loạt (VD: thông báo đến nhiều khách hàng mà không cho phép họ thấy thông tin của nhau).
    // const bcc = [
    //   new Recipient("your_bcc_01@trungquandev.com", "Your Client BCC 01"),
    //   new Recipient("your_bcc_02@trungquandev.com", "Your Client BCC 02"),
    //   new Recipient("your_bcc_03@trungquandev.com", "Your Client BCC 03"),
    // ];

    const buildAttachments = attachments.map((att) => {
      return new Attachment(
        fs.readFileSync(att.filePath, { encoding: "base64" }),
        att.fileName,
        att.attachmentType,
        att.fileId, // for inline attachments and setHTML()
      );
    });

    const emailParams = new EmailParams()
      .setFrom(sendFrom)
      .setTo(recipients)
      //   .setCc(cc)
      //   .setBcc(bcc)
      .setReplyTo(sendFrom)
      .setSubject(subject)
      //.setHtml(html) // use this html to attach file for content,
      // not recommend, must use templateId and dynamic data for inline attachments,
      // custom template to add image url in mailer send template
      .setTemplateId(templateId)
      .setPersonalization(personalizationData)
      .setAttachments(buildAttachments);
    // .setText()

    const data = await MailerSendInstance.email.send(emailParams);

    return data;
  } catch (error) {
    throw error;
  }
};

export const MailerSendWithInlineAttachmentsProvider = { sendEmail };
