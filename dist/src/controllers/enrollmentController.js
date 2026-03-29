import { StatusCodes } from "http-status-codes";
import { enrollmentService } from "../services/enrollmentService.js";
const createEnrollment = async (req, res, next) => {
    try {
        const enrollment = await enrollmentService.createEnrollment(req.body);
        res.status(StatusCodes.CREATED).json(enrollment);
    }
    catch (error) {
        next(error);
    }
};
const getEnrollmentsByStudentId = async (req, res, next) => {
    try {
        const { studentId } = req.params;
        const enrollments = await enrollmentService.getEnrollmentsByStudentId(Number(studentId));
        res.status(StatusCodes.OK).json(enrollments);
    }
    catch (error) {
        next(error);
    }
};
const getStudentsByLecturerId = async (req, res, next) => {
    try {
        const { lecturerId } = req.params;
        const students = await enrollmentService.getStudentsByLecturerId(Number(lecturerId));
        res.status(StatusCodes.OK).json(students);
    }
    catch (error) {
        next(error);
    }
};
export const enrollmentController = {
    createEnrollment,
    getEnrollmentsByStudentId,
    getStudentsByLecturerId,
};
//# sourceMappingURL=enrollmentController.js.map