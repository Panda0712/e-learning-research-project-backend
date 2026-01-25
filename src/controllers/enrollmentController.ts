import { Request, Response, NextFunction } from 'express';
import { enrollmentService } from '../services/enrollmentService.js';

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const enrollment = await enrollmentService.createEnrollment(req.body);
    
    res.status(201).json({
      message: 'Đăng ký khóa học thành công!',
      data: enrollment,
    });
  } catch (error: any) {
    if (error.message === 'Sinh viên đã đăng ký khóa học này rồi!') {
       res.status(409).json({ message: error.message }); 
       return; 
    }
    next(error);
  }
};

const getMyCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentId } = req.query;

    if (!studentId) {
      res.status(400).json({ message: 'Vui lòng cung cấp studentId!' });
      return;
    }

    const enrollments = await enrollmentService.getEnrollmentsByStudentId(Number(studentId));

    res.status(200).json({
      message: 'Lấy danh sách khóa học của tôi thành công',
      data: enrollments,
    });
  } catch (error) {
    next(error);
  }
};

export const enrollmentController = {
  create,
  getMyCourses,
};