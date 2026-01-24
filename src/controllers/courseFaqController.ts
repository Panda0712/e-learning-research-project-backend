import { Request, Response, NextFunction } from 'express';
import { courseFaqService } from '../services/courseFaqService.js'; 
import { prisma } from '@/lib/prisma.js';

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newFaq = await courseFaqService.createFaq(req.body);
    res.status(201).json({
      message: 'Create FAQ success!',
      data: newFaq,
    });
  } catch (error) {
    next(error);
  }
};

const getByCourseId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.query; 

    if (!courseId) {
      res.status(400).json({ message: "Vui lòng cung cấp courseId!" });
      return;
    }

    const faqs = await prisma.courseFAQ.findMany({
      where: {
        courseId: Number(courseId) 
      },
      include: {
        course: true 
      }
    });

    res.status(200).json({
      message: "Lấy danh sách FAQ thành công",
      data: faqs
    });

  } catch (error) {
    next(error);
  }
};

export const courseFaqController = {
  create,
  getByCourseId,
};