import { User, UserWithAvatar } from "@/types/user.type.js";
export declare const slugify: (val: string) => string;
export declare const normalizeConversationRole: (role: "STUDENT" | "LECTURER") => "student" | "lecturer";
export declare const pickUser: (user: User) => Pick<User, "createdAt" | "updatedAt" | "id" | "email" | "firstName" | "lastName" | "phoneNumber" | "dateOfBirth" | "role" | "isVerified" | "avatar"> | undefined;
export declare const pickUserWithAvatar: (user: UserWithAvatar) => {
    avatar: {
        fileUrl: string | null;
    } | null;
    createdAt: Date;
    updatedAt?: Date | null;
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber?: string | null;
    dateOfBirth?: Date | null;
    role: string;
    isVerified: boolean;
} | undefined;
export declare const calculateDateRange: (period: string, customFrom?: string, customTo?: string) => {
    startDate: Date;
    endDate: Date;
    groupBy: "day" | "month";
};
export declare const initChartData: (startDate: Date, endDate: Date, groupBy: "day" | "month") => {
    labels: string[];
    emptyData: number[];
};
export declare const getDateIndex: (date: Date, startDate: Date, groupBy: string) => number;
export declare const getPermissionsFromRole: (roleName: string) => Promise<unknown[]>;
//# sourceMappingURL=helpers.d.ts.map