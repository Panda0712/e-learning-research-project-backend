import { Request, Response, NextFunction } from 'express';
import { transactionService } from '../services/transactionService.js';

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, items, paymentMethod } = req.body;

    if (!userId || !items || items.length === 0 || !paymentMethod) {
      res.status(400).json({ 
        message: "Dữ liệu không hợp lệ! Vui lòng cung cấp đầy đủ: userId, items và paymentMethod." 
      });
      return;
    }

    const validMethods = ['VNPAY', 'MOMO', 'BANK_TRANSFER', 'CASH'];
    if (!validMethods.includes(paymentMethod)) {
       res.status(400).json({ 
        message: "Phương thức thanh toán không hợp lệ" 
      });
      return;
    }

    const transaction = await transactionService.createTransaction(req.body);

    res.status(201).json({
      message: "Giao dịch thành công!",
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

const getHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      res.status(400).json({ message: "Vui lòng cung cấp userId" });
      return;
    }

    const history = await transactionService.getHistoryByUserId(Number(userId));

    res.status(200).json({
      message: "Lấy lịch sử giao dịch thành công",
      data: history
    });
  } catch (error) {
    next(error);
  }
};

export const transactionController = {
  create,
  getHistory
};