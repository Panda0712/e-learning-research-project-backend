type SendDirectMessageInput = {
    conversationId?: number;
    recipientId?: number;
    content?: string;
    imgUrl?: string;
};
export declare const messageService: {
    sendDirectMessage: (senderId: number, input: SendDirectMessageInput) => Promise<{
        message: {
            id: number;
            conversationId: number;
            senderId: number;
            content: string | null;
            imgUrl: string | null;
            createdAt: Date;
            sender: {
                id: number;
                firstName: string | null;
                lastName: string | null;
                avatarUrl: string | null;
            };
        };
        conversation: {
            id: number;
            studentId: number;
            lecturerId: number;
            lastMessageId: number | null;
            lastMessageContent: string | null;
            lastMessageSenderId: number | null;
            lastMessageAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            participants: {
                id: number;
                firstName: string | null;
                lastName: string | null;
                avatarUrl: string | null;
                role: "lecturer" | "student";
                joinedAt: Date;
                lastReadAt: Date | null;
                unreadCount: number;
            }[];
            seenBy: {
                id: number;
                firstName: string | null;
                lastName: string | null;
                avatarUrl: string | null;
            }[];
            unreadCounts: {
                [k: string]: number;
            };
            myUnreadCount: number;
        };
        unreadCounts: {
            [k: string]: number;
        };
    }>;
};
export {};
//# sourceMappingURL=messageService.d.ts.map