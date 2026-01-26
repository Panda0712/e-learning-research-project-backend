import { prisma } from '../lib/prisma.js';

const getTransactionsByCourseId = async (courseId: number) => {
  return await prisma.transactionStudent.findMany({
    where: {
      courseId: Number(courseId),
      transaction: {
        status: 'success'
      }
    },
    include: {
      transaction: {
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true } 
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

export const transactionStudentService = {
  getTransactionsByCourseId
};