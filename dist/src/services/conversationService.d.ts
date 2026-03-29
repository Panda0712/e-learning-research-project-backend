export declare const conversationService: {
    createConversation: (currentUserId: number, recipientId: number) => Promise<{
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
    }>;
    getConversations: (currentUserId: number) => Promise<{
        conversations: {
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
        }[];
    }>;
    getMessages: (conversationId: number, currentUserId: number, options: {
        limit?: number;
        cursor?: number;
    }) => Promise<{
        messages: {
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
        }[];
        nextCursor: number | null;
    }>;
    markAsSeen: (conversationId: number, currentUserId: number) => Promise<{
        message: string;
        seenBy?: never;
        myUnreadCount?: never;
    } | {
        message: string;
        seenBy: {
            id: number;
            firstName: string | null;
            lastName: string | null;
            avatarUrl: string | null;
        }[];
        myUnreadCount: number;
    }>;
    getUserConversationsForSocketIO: (userId: number) => Promise<number[]>;
};
//# sourceMappingURL=conversationService.d.ts.map