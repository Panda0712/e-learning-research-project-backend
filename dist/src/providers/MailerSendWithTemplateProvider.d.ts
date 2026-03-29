import { Personalization } from "mailersend/lib/modules/Email.module.js";
export declare const MailerSendWithTemplateProvider: {
    sendEmail: ({ to, toName, subject, html, templateId, personalizationData, }: {
        to: string;
        toName: string;
        subject: string;
        html: string;
        templateId: string;
        personalizationData: Personalization[];
    }) => Promise<import("mailersend/lib/services/request.service.js").APIResponse>;
};
//# sourceMappingURL=MailerSendWithTemplateProvider.d.ts.map