import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { transactionService } from "../services/transactionService.js";
const createTransaction = async (req, res, next) => {
    try {
        const { paymentMethod } = req.body;
        const validMethods = ["VNPAY", "MOMO", "BANK_TRANSFER", "CASH"];
        if (!validMethods.includes(paymentMethod)) {
            next(new ApiError(StatusCodes.BAD_REQUEST, "Invalid payment method!"));
        }
        const transaction = await transactionService.createTransaction(req.body);
        res.status(StatusCodes.CREATED).json(transaction);
    }
    catch (error) {
        next(error);
    }
};
const getHistoryByUserId = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const history = await transactionService.getHistoryByUserId(Number(userId));
        res.status(StatusCodes.OK).json(history);
    }
    catch (error) {
        next(error);
    }
};
const getStudentTransactionsByCourseId = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const result = await transactionService.getStudentTransactionsByCourseId(Number(courseId));
        res.status(StatusCodes.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
const getAllTransactions = async (req, res, next) => {
    try {
        const transactions = await transactionService.getAllTransactions();
        res.status(StatusCodes.OK).json(transactions);
    }
    catch (error) {
        next(error);
    }
};
export const transactionController = {
    createTransaction,
    getHistoryByUserId,
    getStudentTransactionsByCourseId,
    getAllTransactions,
};
//# sourceMappingURL=transactionController.js.map