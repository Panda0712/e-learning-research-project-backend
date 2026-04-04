import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from "@/utils/constants.js";
import { StatusCodes } from "http-status-codes";
import { assessmentService } from "./assessmentService.js";

const resolveCourseIdByQuizId = async (quizId: number) => {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId, isDestroyed: false },
    select: {
      lesson: {
        select: {
          module: {
            select: {
              courseId: true,
            },
          },
        },
      },
    },
  });

  return Number(quiz?.lesson?.module?.courseId || 0);
};

const updateEnrollmentTrackingForCourse = async (
  studentId: number,
  courseId: number,
) => {
  if (!Number.isInteger(studentId) || studentId <= 0) return;
  if (!Number.isInteger(courseId) || courseId <= 0) return;

  const [courseQuizCount, submissions] = await Promise.all([
    prisma.quiz.count({
      where: {
        isDestroyed: false,
        lesson: {
          isDestroyed: false,
          module: {
            isDestroyed: false,
            courseId,
          },
        },
      },
    }),
    prisma.submission.findMany({
      where: {
        studentId,
        isDestroyed: false,
        quiz: {
          isDestroyed: false,
          lesson: {
            isDestroyed: false,
            module: {
              isDestroyed: false,
              courseId,
            },
          },
        },
      },
      orderBy: { submittedAt: "desc" },
      select: {
        quizId: true,
        score: true,
        submittedAt: true,
        quiz: {
          select: {
            passingScore: true,
          },
        },
      },
    }),
  ]);

  const latestSubmissionByQuiz = new Map<number, { score: number }>();
  for (const item of submissions) {
    if (!latestSubmissionByQuiz.has(item.quizId)) {
      latestSubmissionByQuiz.set(item.quizId, {
        score: Number(item.score || 0),
      });
    }
  }

  let passedQuizCount = 0;
  for (const [quizId, latest] of latestSubmissionByQuiz.entries()) {
    const matched = submissions.find((x) => x.quizId === quizId);
    const passingScore = Number(matched?.quiz?.passingScore ?? 70);
    if (latest.score >= passingScore) passedQuizCount += 1;
  }

  const progress =
    courseQuizCount > 0
      ? Math.min(100, Math.round((passedQuizCount / courseQuizCount) * 100))
      : 0;

  const existingEnrollment = await prisma.enrollment.findFirst({
    where: {
      studentId,
      courseId,
      isDestroyed: false,
    },
    select: { id: true },
  });

  if (existingEnrollment?.id) {
    await prisma.enrollment.update({
      where: { id: existingEnrollment.id },
      data: {
        progress,
        status: progress >= 100 ? "completed" : "enrolled",
        lastAccessedAt: new Date(),
      },
    });
  } else {
    await prisma.enrollment.create({
      data: {
        studentId,
        courseId,
        progress,
        status: progress >= 100 ? "completed" : "enrolled",
        lastAccessedAt: new Date(),
      },
    });
  }
};

const createSubmission = async (data: {
  assessmentId?: number;
  quizId: number;
  studentId: number;
  score?: number;
  status?: string;
  feedback?: string;
  submittedAt?: Date;
}) => {
  try {
    // Check if student exists
    const student = await prisma.user.findUnique({
      where: { id: data.studentId, isDestroyed: false },
    });

    if (!student) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Student not found!");
    }

    // Check if quiz exists
    const quiz = await prisma.quiz.findUnique({
      where: { id: data.quizId, isDestroyed: false },
      include: {
        lesson: {
          include: {
            module: {
              select: {
                courseId: true,
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Quiz not found!");
    }

    let resolvedAssessmentId = Number(data.assessmentId || 0);

    if (Number.isInteger(resolvedAssessmentId) && resolvedAssessmentId > 0) {
      const assessment = await prisma.assessment.findUnique({
        where: { id: resolvedAssessmentId, isDestroyed: false },
      });

      if (!assessment) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Assessment not found!");
      }
    } else {
      const lessonId = Number(quiz.lessonId || 0);
      const courseId = Number(quiz.lesson?.module?.courseId || 0);

      if (!Number.isInteger(lessonId) || lessonId <= 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Quiz lesson not found!");
      }

      if (!Number.isInteger(courseId) || courseId <= 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Quiz course not found!");
      }

      const existingAssessment = await prisma.assessment.findFirst({
        where: {
          lessonId,
          courseId,
          type: "quiz",
          isDestroyed: false,
        },
        select: { id: true },
      });

      if (existingAssessment?.id) {
        resolvedAssessmentId = existingAssessment.id;
      } else {
        const createdAssessment = await prisma.assessment.create({
          data: {
            courseId,
            lessonId,
            title: `Auto quiz assessment - Lesson ${lessonId}`,
            type: "quiz",
            status: "published",
            totalSubmissions: 0,
            averageScore: 0,
          },
          select: { id: true },
        });

        resolvedAssessmentId = createdAssessment.id;
      }
    }

    const newSubmission = await prisma.submission.create({
      data: {
        assessmentId: resolvedAssessmentId,
        quizId: data.quizId,
        studentId: data.studentId,
        score: data.score ?? null,
        status: data.status ?? null,
        feedback: data.feedback ?? null,
        submittedAt: data.submittedAt || new Date(),
      },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        assessment: {
          select: {
            id: true,
            title: true,
          },
        },
        quiz: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    await assessmentService.updateAssessmentStats(resolvedAssessmentId);
    const resolvedCourseId = Number(quiz.lesson?.module?.courseId || 0);
    await updateEnrollmentTrackingForCourse(data.studentId, resolvedCourseId);

    return newSubmission;
  } catch (error) {
    throw error;
  }
};

const getSubmissionById = async (id: number) => {
  try {
    const submission = await prisma.submission.findUnique({
      where: { id, isDestroyed: false },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        assessment: {
          select: {
            id: true,
            title: true,
          },
        },
        quiz: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!submission) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Submission not found!");
    }

    return submission;
  } catch (error) {
    throw error;
  }
};

const getAllSubmissions = async (params: {
  page?: number;
  limit?: number;
  studentId?: number;
  assessmentId?: number;
  quizId?: number;
  status?: string;
}) => {
  try {
    const page = params.page || DEFAULT_PAGE;
    const limit = params.limit || DEFAULT_ITEMS_PER_PAGE;
    const skip = (page - 1) * limit;

    const where: any = { isDestroyed: false };

    if (params.studentId) {
      where.studentId = params.studentId;
    }

    if (params.assessmentId) {
      where.assessmentId = params.assessmentId;
    }

    if (params.quizId) {
      where.quizId = params.quizId;
    }

    if (params.status) {
      where.status = params.status;
    }

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: "desc" },
        include: {
          student: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          assessment: {
            select: {
              id: true,
              title: true,
            },
          },
          quiz: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      prisma.submission.count({ where }),
    ]);

    return {
      data: submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw error;
  }
};

const getSubmissionsByStudentId = async (params: {
  studentId: number;
  page?: number;
  limit?: number;
  status?: string;
}) => {
  try {
    const page = params.page || DEFAULT_PAGE;
    const limit = params.limit || DEFAULT_ITEMS_PER_PAGE;
    const skip = (page - 1) * limit;

    const where: any = {
      studentId: params.studentId,
      isDestroyed: false,
    };

    if (params.status) {
      where.status = params.status;
    }

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: "desc" },
        include: {
          student: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          assessment: {
            select: {
              id: true,
              title: true,
            },
          },
          quiz: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      prisma.submission.count({ where }),
    ]);

    return {
      data: submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw error;
  }
};

const updateSubmission = async (
  id: number,
  data: {
    score?: number;
    status?: string;
    feedback?: string;
    submittedAt?: Date;
  },
) => {
  try {
    const submission = await prisma.submission.findUnique({
      where: { id, isDestroyed: false },
    });

    if (!submission) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Submission not found!");
    }

    const updateData: any = {};
    if (data.score !== undefined) updateData.score = data.score;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.feedback !== undefined) updateData.feedback = data.feedback;
    if (data.submittedAt !== undefined)
      updateData.submittedAt = data.submittedAt;

    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        assessment: {
          select: {
            id: true,
            title: true,
          },
        },
        quiz: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    await assessmentService.updateAssessmentStats(
      updatedSubmission.assessmentId,
    );
    const resolvedCourseId = await resolveCourseIdByQuizId(
      updatedSubmission.quizId,
    );
    await updateEnrollmentTrackingForCourse(
      updatedSubmission.studentId,
      resolvedCourseId,
    );

    return updatedSubmission;
  } catch (error) {
    throw error;
  }
};

const gradeSubmission = async (
  id: number,
  data: {
    score: number;
    feedback?: string;
    status?: string;
  },
) => {
  try {
    const submission = await prisma.submission.findUnique({
      where: { id, isDestroyed: false },
    });

    if (!submission) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Submission not found!");
    }

    const updateData: any = {
      score: data.score,
      status: data.status || "graded",
    };
    if (data.feedback !== undefined) updateData.feedback = data.feedback;

    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        assessment: {
          select: {
            id: true,
            title: true,
          },
        },
        quiz: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    await assessmentService.updateAssessmentStats(
      updatedSubmission.assessmentId,
    );
    const resolvedCourseId = await resolveCourseIdByQuizId(
      updatedSubmission.quizId,
    );
    await updateEnrollmentTrackingForCourse(
      updatedSubmission.studentId,
      resolvedCourseId,
    );

    return updatedSubmission;
  } catch (error) {
    throw error;
  }
};

const deleteSubmission = async (id: number) => {
  try {
    const submission = await prisma.submission.findUnique({
      where: { id, isDestroyed: false },
    });

    if (!submission) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Submission not found!");
    }

    await prisma.submission.update({
      where: { id },
      data: { isDestroyed: true },
    });

    await assessmentService.updateAssessmentStats(submission.assessmentId);

    return { message: "Submission deleted successfully!" };
  } catch (error) {
    throw error;
  }
};

export const submissionService = {
  createSubmission,
  getSubmissionById,
  getAllSubmissions,
  getSubmissionsByStudentId,
  updateSubmission,
  gradeSubmission,
  deleteSubmission,
};
