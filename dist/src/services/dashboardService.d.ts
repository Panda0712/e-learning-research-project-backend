export declare const dashboardService: {
    getAdminStats: (actor: {
        userId: number;
        userRole: string;
    }) => Promise<{
        cards: {
            totalStudents: number;
            totalInstructors: number;
            totalRevenue: number;
            pendingCourses: number;
            newEnrollments: number;
            totalTransactions: number;
        };
        lists: {
            pendingApprovals: {
                type: string;
                avatar: {
                    createdAt: Date;
                    updatedAt: Date | null;
                    isDestroyed: boolean;
                    id: number;
                    publicId: string;
                    fileSize: number | null;
                    fileType: string | null;
                    fileUrl: string;
                } | null;
                title: string;
                time: Date;
                status: string;
            }[];
            topCourses: {
                id: number;
                name: string;
                totalStudents: number;
                thumbnail: {
                    createdAt: Date;
                    updatedAt: Date | null;
                    isDestroyed: boolean;
                    id: number;
                    publicId: string;
                    fileSize: number | null;
                    fileType: string | null;
                    fileUrl: string;
                } | null;
            }[];
        };
    }>;
    getAdminCharts: (actor: {
        userId: number;
        userRole: string;
    }, period?: string, from?: string, to?: string) => Promise<{
        period: string;
        groupBy: "day" | "month";
        labels: string[];
        datasets: {
            signups: number[];
            revenue: number[];
        };
    }>;
    getLecturerStats: ({ lecturerId, userRole, }: {
        lecturerId: number;
        userRole: string;
    }) => Promise<{
        cards: {
            totalStudents: number;
            coursesActive: number;
            totalEarnings: number;
            assignmentsGraded: number;
            completedCourses: number;
            newEnrollments: number;
        };
        recentActivity: {
            type: string;
            avatar: string | {
                createdAt: Date;
                updatedAt: Date | null;
                isDestroyed: boolean;
                id: number;
                publicId: string;
                fileSize: number | null;
                fileType: string | null;
                fileUrl: string;
            } | null;
            title: string;
            time: Date;
        }[];
        topCourses: {
            id: number;
            name: string;
            totalStudents: number;
        }[];
    }>;
    getLecturerCharts: ({ lecturerId, userRole }: {
        lecturerId: number;
        userRole: string;
    }, period?: string, from?: string, to?: string) => Promise<{
        period: string;
        groupBy: "day" | "month";
        labels: string[];
        datasets: {
            engagement: number[];
            revenue: number[];
        };
    }>;
};
//# sourceMappingURL=dashboardService.d.ts.map