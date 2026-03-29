import { Personalization } from "mailersend/lib/modules/Email.module.js";
export declare const MailerSendWithScheduleAndBulkEmailsProvider: {
    sendEmail: ({ to, toName, subject, html, templateId, personalizationData, attachments, sendAt, }: {
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
        sendAt: number;
    }) => Promise<import("mailersend/lib/services/request.service.js").APIResponse>;
};
//# sourceMappingURL=MailerSendWithScheduleAndBulkEmailsProvider.d.ts.map