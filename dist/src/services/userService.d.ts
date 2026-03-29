import { KeyStore } from "@/types/keyStore.type.js";
import { RegisterLecturer } from "@/types/registerLecturer.type.js";
import { UpdateProfile } from "@/types/updateProfile.type.js";
import { User } from "@/types/user.type.js";
export declare const userService: {
    register: (reqBody: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
    }) => Promise<Pick<User, "createdAt" | "updatedAt" | "id" | "email" | "firstName" | "lastName" | "phoneNumber" | "dateOfBirth" | "role" | "isVerified" | "avatar"> | undefined>;
    verifyAccount: (reqBody: {
        email: string;
        token: string;
    }) => Promise<Pick<User, "createdAt" | "updatedAt" | "id" | "email" | "firstName" | "lastName" | "phoneNumber" | "dateOfBirth" | "role" | "isVerified" | "avatar"> | undefined>;
    login: (reqBody: {
        email: string;
        password: string;
    }) => Promise<{
        refreshToken: string;
        accessToken: string;
        kid: string;
        avatar?: {
            fileUrl: string | null;
        } | null;
        createdAt?: Date;
        updatedAt?: Date | null;
        id?: number;
        email?: string;
        firstName?: string | null;
        lastName?: string | null;
        phoneNumber?: string | null;
        dateOfBirth?: Date | null;
        role?: string;
        isVerified?: boolean;
    }>;
    logout: ({ keyStore }: {
        keyStore: KeyStore;
    }) => Promise<true | {
        createdAt: Date;
        updatedAt: Date;
        isDestroyed: boolean;
        id: number;
        userId: number;
        publicKey: string;
        privateKey: string;
        refreshToken: string | null;
        refreshTokenUsed: import("@prisma/client/runtime/client").JsonValue;
        kid: string;
    }>;
    logoutByUserId: (userId: number) => Promise<{
        createdAt: Date;
        updatedAt: Date;
        isDestroyed: boolean;
        id: number;
        userId: number;
        publicKey: string;
        privateKey: string;
        refreshToken: string | null;
        refreshTokenUsed: import("@prisma/client/runtime/client").JsonValue;
        kid: string;
    }>;
    getGoogleAuthUrl: (state: string) => Promise<string>;
    handleGoogleCallback: (code: string) => Promise<{
        refreshToken: string;
        accessToken: string;
        kid: string;
        createdAt?: Date;
        updatedAt?: Date | null;
        id?: number;
        email?: string;
        firstName?: string | null;
        lastName?: string | null;
        phoneNumber?: string | null;
        dateOfBirth?: Date | null;
        role?: string;
        isVerified?: boolean;
        avatar?: string | null;
    }>;
    getMe: (userId: number) => Promise<{
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
    } | undefined>;
    handleRefreshToken: ({ refreshToken, user, keyStore, }: {
        refreshToken: string;
        user?: User;
        keyStore?: KeyStore;
    }) => Promise<{
        user: {
            id: number;
            email: string;
            role: string;
            kid: string;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    findByEmail: ({ email }: {
        email: string;
    }) => Promise<{
        password: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        email: string;
        firstName: string | null;
        lastName: string | null;
        avatarId: number | null;
        phoneNumber: string | null;
        dateOfBirth: Date | null;
        role: string;
        verifyToken: string | null;
        resetPasswordToken: string | null;
        resetPasswordExpires: Date | null;
        isVerified: boolean;
    } | null>;
    updateProfile: (userId: number, reqBody: UpdateProfile, userAvatar?: {
        publicId: string;
        fileUrl: string;
        fileSize?: number;
        fileType?: string;
    } | null) => Promise<Pick<User, "createdAt" | "updatedAt" | "id" | "email" | "firstName" | "lastName" | "phoneNumber" | "dateOfBirth" | "role" | "isVerified" | "avatar"> | undefined>;
    registerLecturerProfile: (userId: number, reqBody: RegisterLecturer) => Promise<{
        lecturer: {
            password: string;
            createdAt: Date;
            updatedAt: Date | null;
            isDestroyed: boolean;
            id: number;
            email: string;
            firstName: string | null;
            lastName: string | null;
            avatarId: number | null;
            phoneNumber: string | null;
            dateOfBirth: Date | null;
            role: string;
            verifyToken: string | null;
            resetPasswordToken: string | null;
            resetPasswordExpires: Date | null;
            isVerified: boolean;
        };
    } & {
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        lecturerId: number;
        totalStudents: number | null;
        lecturerFileId: number | null;
        gender: string | null;
        nationality: string | null;
        professionalTitle: string | null;
        beginStudies: Date | null;
        highestDegree: string | null;
        totalCourses: number | null;
        avgRating: number | null;
        bio: string | null;
        isActive: boolean;
    }>;
    getPublicLecturers: ({ page, itemsPerPage, q, }: {
        page?: number;
        itemsPerPage?: number;
        q?: string;
    }) => Promise<{
        lecturers: ({
            avatar: {
                fileUrl: string;
            } | null;
            lecturerProfile: {
                totalStudents: number | null;
                nationality: string | null;
                professionalTitle: string | null;
                totalCourses: number | null;
                avgRating: number | null;
                bio: string | null;
            } | null;
        } & {
            password: string;
            createdAt: Date;
            updatedAt: Date | null;
            isDestroyed: boolean;
            id: number;
            email: string;
            firstName: string | null;
            lastName: string | null;
            avatarId: number | null;
            phoneNumber: string | null;
            dateOfBirth: Date | null;
            role: string;
            verifyToken: string | null;
            resetPasswordToken: string | null;
            resetPasswordExpires: Date | null;
            isVerified: boolean;
        })[];
        totalLecturers: number;
        pagination: {
            page: number;
            itemsPerPage: number;
            total: number;
            totalPages: number;
        };
    }>;
    getPublicLecturerDetail: (lecturerId: number) => Promise<{
        avatar: {
            fileUrl: string;
        } | null;
        courses: ({
            thumbnail: {
                fileUrl: string;
            } | null;
        } & {
            level: string | null;
            status: string;
            createdAt: Date;
            updatedAt: Date | null;
            isDestroyed: boolean;
            id: number;
            name: string;
            lecturerId: number;
            categoryId: number | null;
            thumbnailId: number | null;
            lecturerName: string | null;
            duration: string | null;
            totalStudents: number;
            totalLessons: number;
            totalQuizzes: number;
            overview: string | null;
            price: number;
        })[];
        lecturerProfile: ({
            lecturerFile: {
                fileType: string | null;
                fileUrl: string;
            } | null;
        } & {
            createdAt: Date;
            updatedAt: Date | null;
            isDestroyed: boolean;
            id: number;
            lecturerId: number;
            totalStudents: number | null;
            lecturerFileId: number | null;
            gender: string | null;
            nationality: string | null;
            professionalTitle: string | null;
            beginStudies: Date | null;
            highestDegree: string | null;
            totalCourses: number | null;
            avgRating: number | null;
            bio: string | null;
            isActive: boolean;
        }) | null;
    } & {
        password: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        email: string;
        firstName: string | null;
        lastName: string | null;
        avatarId: number | null;
        phoneNumber: string | null;
        dateOfBirth: Date | null;
        role: string;
        verifyToken: string | null;
        resetPasswordToken: string | null;
        resetPasswordExpires: Date | null;
        isVerified: boolean;
    }>;
    forgotPassword: (email: string) => Promise<{
        createdAt?: Date;
        updatedAt?: Date | null;
        id?: number;
        email?: string;
        firstName?: string | null;
        lastName?: string | null;
        phoneNumber?: string | null;
        dateOfBirth?: Date | null;
        role?: string;
        isVerified?: boolean;
        avatar?: string | null;
        message: string;
    }>;
    resetPassword: ({ token, newPassword, }: {
        token: string;
        newPassword: string;
    }) => Promise<{
        createdAt?: Date;
        updatedAt?: Date | null;
        id?: number;
        email?: string;
        firstName?: string | null;
        lastName?: string | null;
        phoneNumber?: string | null;
        dateOfBirth?: Date | null;
        role?: string;
        isVerified?: boolean;
        avatar?: string | null;
        message: string;
    }>;
    createUserDocument: (data: any) => Promise<{
        password: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        email: string;
        firstName: string | null;
        lastName: string | null;
        avatarId: number | null;
        phoneNumber: string | null;
        dateOfBirth: Date | null;
        role: string;
        verifyToken: string | null;
        resetPasswordToken: string | null;
        resetPasswordExpires: Date | null;
        isVerified: boolean;
    }>;
    updateUserDocument: (id: number, data: any) => Promise<{
        password: string;
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        email: string;
        firstName: string | null;
        lastName: string | null;
        avatarId: number | null;
        phoneNumber: string | null;
        dateOfBirth: Date | null;
        role: string;
        verifyToken: string | null;
        resetPasswordToken: string | null;
        resetPasswordExpires: Date | null;
        isVerified: boolean;
    }>;
    facebookAuthHandler: (accessToken: string) => Promise<{
        refreshToken: string;
        accessToken: string;
        kid: string;
        createdAt?: Date;
        updatedAt?: Date | null;
        id?: number;
        email?: string;
        firstName?: string | null;
        lastName?: string | null;
        phoneNumber?: string | null;
        dateOfBirth?: Date | null;
        role?: string;
        isVerified?: boolean;
        avatar?: string | null;
    }>;
};
//# sourceMappingURL=userService.d.ts.map