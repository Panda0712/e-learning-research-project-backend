export declare const reviewService: {
    getHighlightReviews: (limit?: number) => Promise<{
        id: any;
        heading: any;
        content: any;
        studentName: any;
        studentAvatar: any;
        rating: any;
    }[]>;
    getReviewsByCourseId: (courseId: number, limit?: number) => Promise<{
        id: any;
        heading: any;
        content: any;
        studentName: any;
        studentAvatar: any;
        rating: any;
    }[]>;
    getReviewsByCourseIdV2: (courseId: number, page?: number, itemsPerPage?: number, limit?: number) => Promise<{
        data: {
            id: any;
            heading: any;
            content: any;
            studentName: any;
            studentAvatar: any;
            rating: any;
        }[];
        pagination: {
            page: number;
            itemsPerPage: number;
            total: number;
            totalPages: number;
        };
    }>;
};
//# sourceMappingURL=reviewService.d.ts.map