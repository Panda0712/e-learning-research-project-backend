import { prisma } from '../lib/prisma.js'; 

const createEnrollment = async (data: any) => {
  const { studentId, courseId } = data;

  const existingEnrollment = await prisma.enrollment.findFirst({
    where: {
      studentId: Number(studentId),
      courseId: Number(courseId),
    },
  });

  if (existingEnrollment) {
    throw new Error('Sinh viên đã đăng ký khóa học này rồi!');
  }

  return await prisma.enrollment.create({
    data: {
      studentId: Number(studentId),
      courseId: Number(courseId),
      status: 'enrolled', 
      progress: 0,
    },
  });
};

const getEnrollmentsByStudentId = async (studentId: number) => {
  return await prisma.enrollment.findMany({
    where: {
      studentId: Number(studentId),
    },
    include: {
      course: true, 
    },
    orderBy: {
      createdAt: 'desc', 
    },
  });
};

export const enrollmentService = {
  createEnrollment,
  getEnrollmentsByStudentId,
};