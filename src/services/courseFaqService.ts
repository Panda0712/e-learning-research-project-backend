import { prisma } from '../lib/prisma.js';

const createFaq = async (data: any) => {
  return await prisma.courseFAQ.create({
    data: {
      courseId: Number(data.courseId), 
      question: data.question,
      answer: data.answer,
    },
  });
};

const getFaqsByCourseId = async (courseId: number) => {
  return await prisma.courseFAQ.findMany({
    where: { 
      courseId: courseId,
      isDestroyed: false 
    },
  });
};

export const courseFaqService = {
  createFaq,
  getFaqsByCourseId,
};