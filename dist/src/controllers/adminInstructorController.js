import { StatusCodes } from "http-status-codes";
import { adminInstructorService } from "@/services/adminInstructorService.js";
const getAllRequests = async (req, res, next) => {
    try {
        const result = await adminInstructorService.getAllRequests();
        res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
const approveRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await adminInstructorService.approveRequest(Number(id));
        res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
const rejectRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await adminInstructorService.rejectRequest(Number(id));
        res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
export const adminInstructorController = {
    getAllRequests,
    approveRequest,
    rejectRequest,
};
//# sourceMappingURL=adminInstructorController.js.map