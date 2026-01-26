import { prisma } from '../lib/prisma.js';

const createAssessment = async (data: any) => {
  return await prisma.assessment.create({
    data: {
      courseId: Number(data.courseId),
      lessonId: data.lessonId ? Number(data.lessonId) : null,
      title: data.title,
      type: data.type || 'quiz',
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      status: 'published',
      totalSubmissions: 0,
      averageScore: 0
    }
  });
};

const getAssessmentsForLecturer = async (lecturerId: number) => {
  const assessments = await prisma.assessment.findMany({
    where: { course: { lecturerId: Number(lecturerId) } },
    include: {
      course: { select: { name: true, _count: { select: { enrollments: true } } } },
      _count: { select: { submissions: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return assessments.map(a => ({
    id: a.id,
    title: a.title,
    courseName: a.course?.name,
    submissionsText: `${a._count.submissions}/${a.course?._count.enrollments}`,
    status: a.dueDate && new Date(a.dueDate) < new Date() ? 'Closed' : 'Open',
    dueDate: a.dueDate
  }));
};

const getAssessmentById = async (id: number) => {
  return await prisma.assessment.findUnique({ where: { id: Number(id) } });
};

const getSubmissionsDetail = async (assessmentId: number) => {
  return await prisma.submission.findMany({
    where: { assessmentId: Number(assessmentId) },
    include: { student: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    orderBy: { score: 'desc' }
  });
};

const updateAssessment = async (id: number, data: any) => {
  const updateData: any = {
    title: data.title,
    status: data.status
  };

  if (data.dueDate) {
    updateData.dueDate = new Date(data.dueDate);
  }

  return await prisma.assessment.update({
    where: { id: Number(id) },
    data: updateData
  });
};

const updateFeedback = async (submissionId: number, feedback: string) => {
  return await prisma.submission.update({
    where: { id: Number(submissionId) },
    data: { feedback }
  });
};

const deleteAssessment = async (id: number) => {
  return await prisma.assessment.update({
    where: { id: Number(id) },
    data: { isDestroyed: true }
  });
};

export const assessmentService = {
  createAssessment,
  getAssessmentsForLecturer, 
  getAssessmentById,
  getSubmissionsDetail,      
  updateAssessment,
  updateFeedback,            
  deleteAssessment
};