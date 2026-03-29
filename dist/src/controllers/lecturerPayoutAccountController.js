import { lecturerPayoutAccountService } from "@/services/lecturerPayoutAccountService.js";
import { StatusCodes } from "http-status-codes";
const createLecturerPayoutAccount = async (req, res, next) => {
    try {
        const newPayoutAccount = await lecturerPayoutAccountService.createLecturerPayoutAccount(req.body);
        res.status(StatusCodes.CREATED).json(newPayoutAccount);
    }
    catch (error) {
        next(error);
    }
};
const getLecturerPayoutAccountById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const payoutAccount = await lecturerPayoutAccountService.getLecturerPayoutAccountById(Number(id));
        res.status(StatusCodes.OK).json(payoutAccount);
    }
    catch (error) {
        next(error);
    }
};
const getAllLecturerPayoutAccounts = async (req, res, next) => {
    try {
        const { page, limit, lecturerId } = req.query;
        const filterParams = {};
        if (page)
            filterParams.page = Number(page);
        if (limit)
            filterParams.limit = Number(limit);
        if (lecturerId)
            filterParams.lecturerId = Number(lecturerId);
        const payoutAccounts = await lecturerPayoutAccountService.getAllLecturerPayoutAccounts(filterParams);
        res.status(StatusCodes.OK).json(payoutAccounts);
    }
    catch (error) {
        next(error);
    }
};
const getPayoutAccountsByLecturerId = async (req, res, next) => {
    try {
        const { lecturerId } = req.params;
        const { page, limit } = req.query;
        const filterParams = { lecturerId: Number(lecturerId) };
        if (page)
            filterParams.page = Number(page);
        if (limit)
            filterParams.limit = Number(limit);
        const payoutAccounts = await lecturerPayoutAccountService.getPayoutAccountsByLecturerId(filterParams);
        res.status(StatusCodes.OK).json(payoutAccounts);
    }
    catch (error) {
        next(error);
    }
};
const getDefaultPayoutAccount = async (req, res, next) => {
    try {
        const { lecturerId } = req.params;
        const payoutAccount = await lecturerPayoutAccountService.getDefaultPayoutAccount(Number(lecturerId));
        res.status(StatusCodes.OK).json(payoutAccount);
    }
    catch (error) {
        next(error);
    }
};
const updateLecturerPayoutAccount = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedPayoutAccount = await lecturerPayoutAccountService.updateLecturerPayoutAccount(Number(id), req.body);
        res.status(StatusCodes.OK).json(updatedPayoutAccount);
    }
    catch (error) {
        next(error);
    }
};
const setDefaultPayoutAccount = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { lecturerId } = req.body;
        const updatedPayoutAccount = await lecturerPayoutAccountService.setDefaultPayoutAccount(Number(id), Number(lecturerId));
        res.status(StatusCodes.OK).json(updatedPayoutAccount);
    }
    catch (error) {
        next(error);
    }
};
const deleteLecturerPayoutAccount = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await lecturerPayoutAccountService.deleteLecturerPayoutAccount(Number(id));
        res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
export const lecturerPayoutAccountController = {
    createLecturerPayoutAccount,
    getLecturerPayoutAccountById,
    getAllLecturerPayoutAccounts,
    getPayoutAccountsByLecturerId,
    getDefaultPayoutAccount,
    updateLecturerPayoutAccount,
    setDefaultPayoutAccount,
    deleteLecturerPayoutAccount,
};
//# sourceMappingURL=lecturerPayoutAccountController.js.map