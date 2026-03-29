export declare const homepageService: {
    getHomepageStats: () => Promise<{
        mentors: number;
        hours: number;
        students: number;
    }>;
    getPopularCourses: (limit?: number) => Promise<{
        id: number;
        name: string;
        thumbnailUrl: string | null;
        avgRating: number;
        ratingCount: number;
    }[]>;
    getHomepageData: (opts?: {
        popularLimit?: number;
        reviewLimit?: number;
    }) => Promise<{
        stats: {
            mentors: number;
            hours: number;
            students: number;
        };
        popularCourses: {
            id: number;
            name: string;
            thumbnailUrl: string | null;
            avgRating: number;
            ratingCount: number;
        }[];
        feedbacks: {
            id: any;
            heading: any;
            content: any;
            studentName: any;
            studentAvatar: any;
            rating: any;
        }[];
    }>;
};
//# sourceMappingURL=homepageService.d.ts.map