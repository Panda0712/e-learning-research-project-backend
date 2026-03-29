import { submissionService } from "@/services/submissionService.js";
import { StatusCodes } from "http-status-codes";
const createSubmission = async (req, res, next) => {
    try {
        const newSubmission = await submissionService.createSubmission(req.body);
        res.status(StatusCodes.CREATED).json(newSubmission);
    }
    catch (error) {
        next(error);
    }
};
const getSubmissionById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const submission = await submissionService.getSubmissionById(Number(id));
        res.status(StatusCodes.OK).json(submission);
    }
    catch (error) {
        next(error);
    }
};
const getAllSubmissions = async (req, res, next) => {
    try {
        const { page, limit, studentId, assessmentId, quizId, status } = req.query;
        const filterParams = {};
        if (page)
            filterParams.page = Number(page);
        if (limit)
            filterParams.limit = Number(limit);
        if (studentId)
            filterParams.studentId = Number(studentId);
        if (assessmentId)
            filterParams.assessmentId = Number(assessmentId);
        if (quizId)
            filterParams.quizId = Number(quizId);
        if (status)
            filterParams.status = String(status);
        const submissions = await submissionService.getAllSubmissions(filterParams);
        res.status(StatusCodes.OK).json(submissions);
    }
    catch (error) {
        next(error);
    }
};
const getSubmissionsByStudentId = async (req, res, next) => {
    try {
        const { studentId } = req.params;
        const { page, limit, status } = req.query;
        const filterParams = { studentId: Number(studentId) };
        if (page)
            filterParams.page = Number(page);
        if (limit)
            filterParams.limit = Number(limit);
        if (status)
            filterParams.status = String(status);
        const submissions = await submissionService.getSubmissionsByStudentId(filterParams);
        res.status(StatusCodes.OK).json(submissions);
    }
    catch (error) {
        next(error);
    }
};
const updateSubmission = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedSubmission = await submissionService.updateSubmission(Number(id), req.body);
        res.status(StatusCodes.OK).json(updatedSubmission);
    }
    catch (error) {
        next(error);
    }
};
const gradeSubmission = async (req, res, next) => {
    try {
        const { id } = req.params;
        const gradedSubmission = await submissionService.gradeSubmission(Number(id), req.body);
        res.status(StatusCodes.OK).json(gradedSubmission);
    }
    catch (error) {
        next(error);
    }
};
const deleteSubmission = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await submissionService.deleteSubmission(Number(id));
        res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
export const submissionController = {
    createSubmission,
    getSubmissionById,
    getAllSubmissions,
    getSubmissionsByStudentId,
    updateSubmission,
    gradeSubmission,
    deleteSubmission,
};
//# sourceMappingURL=submissionController.js.map