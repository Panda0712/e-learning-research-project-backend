import { NextFunction, Request, Response } from "express";
export declare const courseController: {
    createCourseCategory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllCourseCategories: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getCourseFaqById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createCourseFaq: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getCourseFaqByCourseId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createCourse: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateCourse: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteCourse: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    approveCourse: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    rejectCourse: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getCourseById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getListCourses: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getListLecturersByStudentId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllCoursesByStudentId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllCoursesByLecturerId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllCoursesByCategoryId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    uploadCourseThumbnail: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getMyLecturers: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    getMyCourses: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=courseController.d.ts.map