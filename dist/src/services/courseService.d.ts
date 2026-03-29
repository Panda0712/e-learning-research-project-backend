import { CreateCourse, UpdateCourse } from "@/types/course.type.js";
export declare const courseService: {
    createCourseCategory: (data: {
        name: string;
        slug: string;
    }) => Promise<{
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        name: string;
        slug: string;
    }>;
    getAllCourseCategories: () => Promise<{
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        name: string;
        slug: string;
    }[]>;
    createCourseFaq: (data: {
        courseId: number;
        question: string;
        answer: string;
    }) => Promise<{
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        courseId: number;
        question: string;
        answer: string | null;
    }>;
    getFaqsByCourseId: (courseId: number) => Promise<({
        course: {
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
        };
    } & {
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        courseId: number;
        question: string;
        answer: string | null;
    })[]>;
    getCourseFaqById: (id: number) => Promise<({
        course: {
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
        };
    } & {
        createdAt: Date;
        updatedAt: Date | null;
        isDestroyed: boolean;
        id: number;
        courseId: number;
        question: string;
        answer: string | null;
    }) | null>;
    createCourse: (data: CreateCourse) => Promise<{
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
    }>;
    updateCourse: (id: number, updateData: UpdateCourse, actorId: number) => Promise<{
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
    }>;
    deleteCourse: (id: number, actorId: number) => Promise<{
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
    }>;
    approveCourse: (id: number, actorId: number) => Promise<{
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
    }>;
    rejectCourse: (id: number, actorId: number) => Promise<{
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
    }>;
    getListCourses: ({ page, itemsPerPage, q, categoryId, level, price, }: {
        page: number;
        itemsPerPage: number;
        q: string;
        categoryId?: number;
        level?: string;
        price?: string;
    }) => Promise<{
        courses: ({
            lecturer: {
                firstName: string | null;
                lastName: string | null;
                avatar: {
                    fileUrl: string;
                } | null;
            };
            category: {
                id: number;
                name: string;
            } | null;
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
        totalCourses: number;
    }>;
    getCourseById: (id: number) => Promise<{
        lecturer: {
            firstName: string | null;
            lastName: string | null;
            avatar: {
                fileUrl: string;
            } | null;
        };
        category: {
            id: number;
            name: string;
        } | null;
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
    }>;
    getListLecturersByStudentId: (studentId: number, page: number, itemsPerPage: number, q: string) => Promise<{
        lecturers: ({
            avatar: {
                fileUrl: string;
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
    }>;
    getAllCoursesByStudentId: (studentId: number, page: number, itemsPerPage: number, q: string) => Promise<{
        courses: ({
            thumbnail: {
                fileUrl: string;
            } | null;
            enrollments: {
                progress: number;
                lastAccessedAt: Date | null;
            }[];
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
        totalCourses: number;
    }>;
    getAllCoursesByLecturerId: (lecturerId: number) => Promise<({
        lecturer: {
            firstName: string | null;
            lastName: string | null;
            avatar: {
                fileUrl: string;
            } | null;
        };
        category: {
            id: number;
            name: string;
        } | null;
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
    })[]>;
    getAllCoursesByCategoryId: (categoryId: number) => Promise<({
        lecturer: {
            firstName: string | null;
            lastName: string | null;
            avatar: {
                fileUrl: string;
            } | null;
        };
        category: {
            id: number;
            name: string;
        } | null;
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
    })[]>;
};
//# sourceMappingURL=courseService.d.ts.map