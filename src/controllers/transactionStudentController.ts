import { Request, Response, NextFunction } from 'express';
import { transactionStudentService } from '../services/transactionStudentService.js';

const getCourseSales = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.query;

    if (!courseId) {
      res.status(400).json({ message: "Vui lòng cung cấp courseId!" });
      return;
    }

    const sales = await transactionStudentService.getTransactionsByCourseId(Number(courseId));

    res.status(200).json({
      message: "Lấy danh sách người mua khóa học thành công",
      count: sales.length, 
      data: sales
    });
  } catch (error) {
    next(error);
  }
};

export const transactionStudentController = {
  getCourseSales
};