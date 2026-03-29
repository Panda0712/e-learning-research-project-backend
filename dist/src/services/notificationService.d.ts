export declare const notificationService: {
    createNotification: (data: {
        userId: number;
        title: string;
        message: string;
        type?: string;
        relatedId?: number;
    }) => Promise<{
        user: {
            id: number;
            email: string;
            firstName: string | null;
            lastName: string | null;
        };
    } & {
        title: string;
        type: string;
        createdAt: Date;
        isDestroyed: boolean;
        id: number;
        message: string;
        userId: number;
        relatedId: number | null;
        isRead: boolean;
    }>;
    getNotificationsByUserId: (filters: {
        userId: number;
        page?: number;
        limit?: number;
        isRead?: boolean;
    }) => Promise<{
        data: {
            title: string;
            type: string;
            createdAt: Date;
            isDestroyed: boolean;
            id: number;
            message: string;
            userId: number;
            relatedId: number | null;
            isRead: boolean;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getNotificationById: (notificationId: number) => Promise<{
        user: {
            id: number;
            email: string;
            firstName: string | null;
            lastName: string | null;
        };
    } & {
        title: string;
        type: string;
        createdAt: Date;
        isDestroyed: boolean;
        id: number;
        message: string;
        userId: number;
        relatedId: number | null;
        isRead: boolean;
    }>;
    markAsRead: (notificationId: number) => Promise<{
        title: string;
        type: string;
        createdAt: Date;
        isDestroyed: boolean;
        id: number;
        message: string;
        userId: number;
        relatedId: number | null;
        isRead: boolean;
    }>;
    markAllAsRead: (userId: number) => Promise<{
        message: string;
        count: number;
    }>;
    deleteNotification: (notificationId: number) => Promise<{
        message: string;
    }>;
    getUnreadCount: (userId: number) => Promise<{
        unreadCount: number;
    }>;
};
//# sourceMappingURL=notificationService.d.ts.map