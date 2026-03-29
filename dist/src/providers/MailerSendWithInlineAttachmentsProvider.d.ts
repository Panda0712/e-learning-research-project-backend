import { Personalization } from "mailersend/lib/modules/Email.module.js";
export declare const MailerSendWithInlineAttachmentsProvider: {
    sendEmail: ({ to, toName, subject, html, templateId, personalizationData, attachments, }: {
        to: string;
        toName: string;
        subject: string;
        html: string;
        templateId: string;
        personalizationData: Personalization[];
        attachments: [{
            filePath: string;
            fileName: string;
            fileId: string;
            attachmentType: string;
        }];
    }) => Promise<import("mailersend/lib/services/request.service.js").APIResponse>;
};
//# sourceMappingURL=MailerSendWithInlineAttachmentsProvider.d.ts.map