import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../lib/prisma.js";

const createAssessment = async (data: any) => {
  try {
    // check assessment existence
    const checkAssessment = await prisma.assessment.findFirst({
      where: {
        title: data.title,
        isDestroyed: false,
      },
    });

    if (checkAssessment) {
      throw new ApiError(StatusCodes.CONFLICT, "Assessment already exists!");
    }

    // create new assessment
    const newAssessment = await prisma.assessment.create({
      data: {
        courseId: Number(data.courseId),
        lessonId: data.lessonId,
        title: data.title,
        type: data.type || "quiz",
        dueDate: data.dueDate,
        status: "published",
        totalSubmissions: 0,
        averageScore: 0,
      },
    });

    return newAssessment;
  } catch (error: any) {
    throw new Error(error);
  }
};

const getAssessmentsForLecturer = async (lecturerId: number) => {
  try {
    const assessments = await prisma.assessment.findMany({
      where: { course: { lecturerId: Number(lecturerId) } },
      include: {
        course: {
          select: { name: true, _count: { select: { enrollments: true } } },
        },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return assessments.map((a) => ({
      id: a.id,
      title: a.title,
      courseName: a.course?.name,
      submissionsText: `${a._count.submissions}/${a.course?._count.enrollments}`,
      status: a.dueDate && new Date(a.dueDate) < new Date() ? "Closed" : "Open",
      dueDate: a.dueDate,
    }));
  } catch (error: any) {
    throw new Error(error);
  }
};

const getAssessmentById = async (id: number) => {
  return await prisma.assessment.findUnique({ where: { id: Number(id) } });
};

const getSubmissionsDetail = async (assessmentId: number) => {
  try {
    const submissionDetails = await prisma.submission.findMany({
      where: { assessmentId: Number(assessmentId) },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
      orderBy: { score: "desc" },
    });

    return submissionDetails;
  } catch (error: any) {
    throw new Error(error);
  }
};

const updateAssessment = async (
  id: number,
  data: {
    title?: string;
    status?: string;
    dueDate?: Date;
  },
) => {
  try {
    const updateData: any = {
      title: data?.title,
      status: data?.status,
    };

    if (data?.dueDate) {
      updateData.dueDate = new Date(data.dueDate);
    }

    const updatedAssessment = await prisma.assessment.update({
      where: { id: Number(id) },
      data: updateData,
    });

    return updatedAssessment;
  } catch (error: any) {
    throw new Error(error);
  }
};

const updateFeedback = async (submissionId: number, feedback: string) => {
  try {
    // check submission existence
    const checkSubmission = await prisma.submission.findUnique({
      where: { id: Number(submissionId), isDestroyed: false },
    });

    if (!checkSubmission) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Submission not found!");
    }

    const updatedFeedback = await prisma.submission.update({
      where: { id: Number(submissionId) },
      data: { feedback },
    });

    return updatedFeedback;
  } catch (error: any) {
    throw new Error(error);
  }
};

const deleteAssessment = async (id: number) => {
  return await prisma.assessment.update({
    where: { id: Number(id) },
    data: { isDestroyed: true },
  });
};

export const assessmentService = {
  createAssessment,
  getAssessmentsForLecturer,
  getAssessmentById,
  getSubmissionsDetail,
  updateAssessment,
  updateFeedback,
  deleteAssessment,
};
