import { assessmentService } from "../services/assessmentService.js";
import { StatusCodes } from "http-status-codes";
const createAssessment = async (req, res, next) => {
    try {
        const data = await assessmentService.createAssessment(req.body);
        res.status(StatusCodes.CREATED).json(data);
    }
    catch (error) {
        next(error);
    }
};
const getAssessmentsForLecturer = async (req, res, next) => {
    try {
        const { lecturerId } = req.params;
        const data = await assessmentService.getAssessmentsForLecturer(Number(lecturerId));
        res.status(StatusCodes.OK).json(data);
    }
    catch (error) {
        next(error);
    }
};
const getAssessmentById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = await assessmentService.getAssessmentById(Number(id));
        res.status(StatusCodes.OK).json(data);
    }
    catch (error) {
        next(error);
    }
};
const updateAssessment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = await assessmentService.updateAssessment(Number(id), req.body);
        res.status(StatusCodes.OK).json(data);
    }
    catch (error) {
        next(error);
    }
};
const deleteAssessment = async (req, res, next) => {
    try {
        const { id } = req.params;
        await assessmentService.deleteAssessment(Number(id));
        res
            .status(StatusCodes.OK)
            .json({ message: "Deleted assessment successfully!" });
    }
    catch (error) {
        next(error);
    }
};
const getSubmissionDetails = async (req, res, next) => {
    try {
        const { assessmentId } = req.params;
        const data = await assessmentService.getSubmissionsDetail(Number(assessmentId));
        res.status(StatusCodes.OK).json(data);
    }
    catch (error) {
        next(error);
    }
};
const updateFeedback = async (req, res, next) => {
    try {
        const { submissionId, feedback } = req.body;
        const data = await assessmentService.updateFeedback(submissionId, feedback);
        res.status(StatusCodes.OK).json(data);
    }
    catch (error) {
        next(error);
    }
};
export const assessmentController = {
    createAssessment,
    getAssessmentsForLecturer,
    getAssessmentById,
    updateAssessment,
    deleteAssessment,
    getSubmissionDetails,
    updateFeedback,
};
//# sourceMappingURL=assessmentController.js.map