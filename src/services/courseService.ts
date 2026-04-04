import { Prisma } from "@/generated/prisma/client.js";
import { CreateCourse, UpdateCourse } from "@/types/course.type.js";
import ApiError from "@/utils/ApiError.js";
import {
  COURSE_STATUS,
  DEFAULT_ITEMS_PER_PAGE,
  DEFAULT_PAGE,
} from "@/utils/constants.js";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../lib/prisma.js";
import { resourceService } from "./resourceService.js";

const canPublishCourse = async (courseId: number) => {
  const [course, modules] = await Promise.all([
    prisma.course.findUnique({
      where: {
        id: courseId,
        isDestroyed: false,
      },
    }),
    prisma.module.count({ where: { courseId, isDestroyed: false } }),
  ]);

  if (!course) throw new ApiError(StatusCodes.NOT_FOUND, "Course not found!");

  if (!course.name || !course.thumbnailId || modules === 0)
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Course is incomplete to publish!",
    );

  return true;
};

const getCourseStudentState = async (
  courseId: number,
  studentId?: number | null,
) => {
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
      isDestroyed: false,
      status: COURSE_STATUS.PUBLISHED,
    },
    select: {
      id: true,
    },
  });
  if (!course) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Course not found!");
  }

  if (!studentId || !Number.isInteger(studentId) || studentId <= 0) {
    return {
      courseId,
      isAuthenticated: false,
      isPurchased: false,
      isInCart: false,
      canAddToCart: false,
      isInWishlist: false,
      canAddToWishlist: false,
    };
  }

  const [purchased, enrolled, cartItem, wishlistItem] = await Promise.all([
    prisma.orderItem.findFirst({
      where: {
        courseId,
        isDestroyed: false,
        order: {
          studentId,
          isDestroyed: false,
          isSuccess: true,
        },
      },
      select: { id: true },
    }),
    prisma.enrollment.findFirst({
      where: {
        studentId,
        courseId,
        isDestroyed: false,
      },
      select: { id: true },
    }),
    prisma.cartItem.findFirst({
      where: {
        courseId,
        cart: {
          userId: studentId,
          isDestroyed: false,
        },
      },
      select: { id: true },
    }),
    prisma.wishlist.findFirst({
      where: { userId: studentId, courseId, isDestroyed: false },
      select: { id: true },
    }),
  ]);

  const isPurchased = Boolean(purchased || enrolled);
  const isInCart = Boolean(cartItem);
  const isInWishlist = Boolean(wishlistItem);

  return {
    courseId,
    isAuthenticated: true,
    isPurchased,
    isInCart,
    canAddToCart: !isPurchased && !isInCart,
    isInWishlist,
    canAddToWishlist: !isPurchased && !isInWishlist,
  };
};

const ensureLecturerOrAdmin = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId, isDestroyed: false },
    select: { id: true, role: true },
  });

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
  }

  const role = String(user.role || "").toLowerCase();
  if (role !== "lecturer" && role !== "admin") {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You are not allowed to manage courses!",
    );
  }

  return user;
};

const ensureCourseOwnerOrAdmin = async (courseId: number, userId: number) => {
  const user = await ensureLecturerOrAdmin(userId);

  const course = await prisma.course.findUnique({
    where: { id: courseId, isDestroyed: false },
  });

  if (!course) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Course not found!");
  }

  if (user.role !== "admin" && course.lecturerId !== userId) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You are not allowed to modify this course!",
    );
  }

  return { user, course };
};

const createCourseCategory = async (data: { name: string; slug: string }) => {
  try {
    // check category existence
    const category = await prisma.courseCategory.findUnique({
      where: {
        slug: data.slug,
        isDestroyed: false,
      },
    });

    if (category) {
      throw new ApiError(StatusCodes.CONFLICT, "Category already exists!");
    }

    // create category
    const createdCategory = await prisma.courseCategory.create({
      data: {
        name: data.name,
        slug: data.slug,
      },
    });

    return createdCategory;
  } catch (error: any) {
    throw error;
  }
};

const createCourseFaq = async (data: {
  courseId: number;
  question: string;
  answer: string;
}) => {
  try {
    // check faq existence
    const faq = await prisma.courseFAQ.findFirst({
      where: {
        courseId: data.courseId,
        question: data.question,
        isDestroyed: false,
      },
    });

    if (faq) {
      throw new ApiError(StatusCodes.CONFLICT, "FAQ already exists!");
    }

    // create course faq
    const createdCourseFaq = await prisma.courseFAQ.create({
      data: {
        courseId: Number(data.courseId),
        question: data.question,
        answer: data.answer,
      },
    });

    return createdCourseFaq;
  } catch (error: any) {
    throw error;
  }
};

const getAllCourseCategories = async () => {
  return await prisma.courseCategory.findMany({
    where: { isDestroyed: false },
  });
};

const getFaqsByCourseId = async (courseId: number) => {
  try {
    const faqsList = await prisma.courseFAQ.findMany({
      where: {
        courseId: courseId,
        isDestroyed: false,
      },
      include: {
        course: true,
      },
    });

    return faqsList;
  } catch (error: any) {
    throw error;
  }
};

const getCourseFaqById = async (id: number) => {
  try {
    const faq = await prisma.courseFAQ.findUnique({
      where: {
        id: id,
        isDestroyed: false,
      },
      include: {
        course: true,
      },
    });

    return faq;
  } catch (error: any) {
    throw error;
  }
};

const createCourse = async (data: CreateCourse) => {
  try {
    const lecturerId = Number(data.lecturerId);
    if (!Number.isInteger(lecturerId) || lecturerId <= 0) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized lecturer.");
    }

    await ensureLecturerOrAdmin(lecturerId);

    const category = await prisma.courseCategory.findUnique({
      where: { id: Number(data.categoryId), isDestroyed: false },
      select: { id: true },
    });
    if (!category) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Course category not found!");
    }

    // check course existence
    const course = await prisma.course.findFirst({
      where: { name: data.name, isDestroyed: false },
    });
    if (course) {
      throw new ApiError(StatusCodes.CONFLICT, "Course already exists!");
    }

    // create course
    return await prisma.$transaction(async (tx) => {
      const createdResource =
        await resourceService.createResourceWithTransaction(
          {
            publicId: data.thumbnail.publicId,
            fileSize: data.thumbnail.fileSize ?? null,
            fileType: data.thumbnail.fileType ?? null,
            fileUrl: data.thumbnail.fileUrl,
          },
          tx,
        );

      let introVideoResource;
      if (data.introVideo) {
        introVideoResource =
          await resourceService.createResourceWithTransaction(
            {
              publicId: data.introVideo.publicId,
              fileSize: data.introVideo.fileSize ?? null,
              fileType: data.introVideo.fileType ?? null,
              fileUrl: data.introVideo.fileUrl,
            },
            tx,
          );
      }

      const newCourse = await tx.course.create({
        data: {
          lecturerId,
          categoryId: category.id,
          name: data.name,
          lecturerName: data.lecturerName,
          duration: data.duration,
          level: data.level,
          overview: data.overview,
          price: data.price,
          status: data.status,
          thumbnailId: createdResource.id,
          introVideoId: introVideoResource?.id ?? null,
          totalStudents: 0,
          totalLessons: 0,
          totalQuizzes: 0,
        },
      });

      return newCourse;
    });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new ApiError(StatusCodes.CONFLICT, "Course data already exists!");
      }

      if (error.code === "P2003") {
        const fieldName =
          (error.meta as { field_name?: string } | undefined)?.field_name ||
          "unknown-field";
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Invalid relation data for creating course (${fieldName}).`,
        );
      }
    }

    throw error;
  }
};

const updateCourse = async (
  id: number,
  updateData: UpdateCourse,
  actorId: number,
) => {
  try {
    const { course } = await ensureCourseOwnerOrAdmin(id, actorId);

    if (updateData?.thumbnail) {
      return await prisma.$transaction(async (tx) => {
        let courseThumbnailId = course.thumbnailId;

        const createdResource =
          await resourceService.createResourceWithTransaction(
            {
              publicId: updateData.thumbnail!.publicId,
              fileSize: updateData.thumbnail!.fileSize ?? null,
              fileType: updateData.thumbnail!.fileType ?? null,
              fileUrl: updateData.thumbnail!.fileUrl,
            },
            tx,
          );

        courseThumbnailId = createdResource.id;

        if (course.thumbnailId)
          await resourceService.deleteResourceWithTransaction(
            course.thumbnailId,
            tx,
          );

        const updatedCourse = await tx.course.update({
          where: { id },
          data: {
            name: updateData.name ?? course.name,
            lecturerName: updateData.lecturerName ?? course.lecturerName,
            duration: updateData.duration ?? course.duration,
            level: updateData.level ?? course.level,
            overview: updateData.overview ?? course.overview,
            price: updateData.price ?? course.price,
            status: updateData.status ?? course.status,
            thumbnailId: courseThumbnailId,
          },
        });

        return updatedCourse;
      });
    }

    if (updateData?.introVideo) {
      return await prisma.$transaction(async (tx) => {
        let introVideoId = course.introVideoId;

        const createdIntroVideoResource =
          await resourceService.createResourceWithTransaction(
            {
              publicId: updateData.introVideo!.publicId,
              fileSize: updateData.introVideo!.fileSize ?? null,
              fileType: updateData.introVideo!.fileType ?? null,
              fileUrl: updateData.introVideo!.fileUrl,
            },
            tx,
          );

        introVideoId = createdIntroVideoResource.id;

        if (course.introVideoId)
          await resourceService.deleteResourceWithTransaction(
            course.introVideoId,
            tx,
          );

        const updatedCourse = await tx.course.update({
          where: { id },
          data: {
            name: updateData.name ?? course.name,
            lecturerName: updateData.lecturerName ?? course.lecturerName,
            duration: updateData.duration ?? course.duration,
            level: updateData.level ?? course.level,
            overview: updateData.overview ?? course.overview,
            price: updateData.price ?? course.price,
            status: updateData.status ?? course.status,
            introVideoId,
          },
        });

        return updatedCourse;
      });
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        name: updateData.name ?? course.name,
        lecturerName: updateData.lecturerName ?? course.lecturerName,
        duration: updateData.duration ?? course.duration,
        level: updateData.level ?? course.level,
        overview: updateData.overview ?? course.overview,
        price: updateData.price ?? course.price,
        status: updateData.status ?? course.status,
      },
    });

    return updatedCourse;
  } catch (error: any) {
    throw error;
  }
};

const getCourseStudentState = async (courseId: number, studentId: number) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId, isDestroyed: false },
    select: { id: true },
  });

  if (!course) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Course not found!");
  }

  const [purchased, enrolled, inCart] = await Promise.all([
    prisma.orderItem.findFirst({
      where: {
        courseId,
        isDestroyed: false,
        order: {
          studentId,
          isDestroyed: false,
          isSuccess: true,
          paymentStatus: "paid",
        },
      },
      select: { id: true },
    }),
    prisma.enrollment.findFirst({
      where: {
        studentId,
        courseId,
        isDestroyed: false,
      },
      select: { id: true },
    }),
    prisma.cartItem.findFirst({
      where: {
        courseId,
        cart: {
          userId: studentId,
          isDestroyed: false,
        },
      },
      select: { id: true },
    }),
  ]);

  const isPurchased = Boolean(purchased || enrolled);
  const isInCart = Boolean(inCart);

  return {
    courseId,
    isAuthenticated: true,
    isPurchased,
    isInCart,
    canAddToCart: !isPurchased && !isInCart,
  };
};

const deleteCourse = async (id: number, actorId: number) => {
  try {
    await ensureCourseOwnerOrAdmin(id, actorId);

    return await prisma.course.update({
      where: { id },
      data: { isDestroyed: true },
    });
  } catch (error: any) {
    throw error;
  }
};

const approveCourse = async (id: number, actorId: number) => {
  try {
    const { user, course } = await ensureCourseOwnerOrAdmin(id, actorId);

    const role = String(user.role || "").toLowerCase();

    if (role !== "admin") {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Only admin can approve courses!",
      );
    }

    // check course status
    if (
      course.status !== COURSE_STATUS.PENDING &&
      course.status !== COURSE_STATUS.DRAFT
    ) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Course is not pending or draft!",
      );
    }
    if (course.status === COURSE_STATUS.PUBLISHED) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Course is already published!",
      );
    }

    // update course status
    const approvedCourse = await prisma.course.update({
      where: { id },
      data: { status: COURSE_STATUS.PUBLISHED },
    });

    return approvedCourse;
  } catch (error: any) {
    throw error;
  }
};

const rejectCourse = async (id: number, actorId: number) => {
  try {
    const { user, course } = await ensureCourseOwnerOrAdmin(id, actorId);

    const role = String(user.role || "").toLowerCase();

    if (role !== "admin") {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Only admin can reject courses!",
      );
    }

    // check course status
    if (
      course.status !== COURSE_STATUS.PENDING &&
      course.status !== COURSE_STATUS.DRAFT
    ) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Course is not pending or draft!",
      );
    }
    if (course.status === COURSE_STATUS.REJECTED) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Course is already rejected!",
      );
    }

    // update course status
    const rejectedCourse = await prisma.course.update({
      where: { id },
      data: { status: COURSE_STATUS.REJECTED },
    });

    return rejectedCourse;
  } catch (error: any) {
    throw error;
  }
};

const getCourseById = async (id: number) => {
  try {
    // check course existence
    const course = await prisma.course.findUnique({
      where: { id, isDestroyed: false, status: COURSE_STATUS.PUBLISHED },
      include: {
        thumbnail: { select: { fileUrl: true } },
        category: { select: { id: true, name: true } },
        lecturer: {
          select: {
            firstName: true,
            lastName: true,
            avatar: { select: { fileUrl: true } },
          },
        },
      },
    });

    if (!course) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Course not found!");
    }

    return course;
  } catch (error: any) {
    throw error;
  }
};

const getCourseByIdForLecturer = async (courseId: number, actorId: number) => {
  try {
    await ensureCourseOwnerOrAdmin(courseId, actorId);

    const course = await prisma.course.findUnique({
      where: { id: courseId, isDestroyed: false },
      include: {
        thumbnail: true,
        introVideo: true,
        category: { select: { id: true, name: true } },
        courseFAQs: {
          where: { isDestroyed: false },
          select: { id: true, question: true, answer: true },
          orderBy: { id: "asc" },
        },
      },
    });

    if (!course) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Course not found!");
    }

    return course;
  } catch (error: any) {
    throw error;
  }
};

const getListLecturersByStudentId = async (
  studentId: number,
  page: number,
  itemsPerPage: number,
  q: string,
) => {
  try {
    const student = await prisma.user.findUnique({
      where: { id: studentId, isDestroyed: false },
    });
    if (!student)
      throw new ApiError(StatusCodes.NOT_FOUND, "Student not found!");

    const currentPage = page ? Number(page) : DEFAULT_PAGE;
    const perPage = itemsPerPage
      ? Number(itemsPerPage)
      : DEFAULT_ITEMS_PER_PAGE;
    const skip = (currentPage - 1) * perPage;

    const lecturerWhere = {
      isDestroyed: false,
      role: "lecturer",
      courses: {
        some: {
          isDestroyed: false,
          orderItems: {
            some: {
              order: {
                studentId,
                isDestroyed: false,
              },
            },
          },
        },
      },
      ...(q
        ? {
            OR: [
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              {
                courses: {
                  some: {
                    OR: [
                      { name: { contains: q, mode: "insensitive" } },
                      { overview: { contains: q, mode: "insensitive" } },
                    ],
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [lecturers, totalLecturers] = await Promise.all([
      prisma.user.findMany({
        where: lecturerWhere,
        include: {
          avatar: {
            select: {
              fileUrl: true,
            },
          },
        },
        orderBy: { firstName: "asc" },
        skip,
        take: perPage,
      }),
      prisma.user.count({ where: lecturerWhere }),
    ]);

    return { lecturers, totalLecturers };
  } catch (error: any) {
    throw error;
  }
};

const getAllCoursesByStudentId = async (
  studentId: number,
  page: number,
  itemsPerPage: number,
  q: string,
) => {
  try {
    const student = await prisma.user.findUnique({
      where: { id: studentId, isDestroyed: false },
    });
    if (!student) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Student not found!");
    }

    const currentPage = page ? Number(page) : DEFAULT_PAGE;
    const perPage = itemsPerPage
      ? Number(itemsPerPage)
      : DEFAULT_ITEMS_PER_PAGE;
    const skip = (currentPage - 1) * perPage;

    const where = {
      isDestroyed: false,
      orderItems: {
        some: {
          order: {
            studentId,
            isDestroyed: false,
          },
        },
      },
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { lecturerName: { contains: q, mode: "insensitive" } },
              { overview: { contains: q, mode: "insensitive" } },
              { level: { contains: q, mode: "insensitive" } },
              { status: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [courses, totalCourses] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          thumbnail: {
            select: {
              fileUrl: true,
            },
          },
          enrollments: {
            where: { studentId },
            select: {
              progress: true,
              lastAccessedAt: true,
            },
          },
        },
        orderBy: { name: "asc" },
        skip,
        take: perPage,
      }),
      prisma.course.count({ where }),
    ]);

    return { courses, totalCourses };
  } catch (error: any) {
    throw error;
  }
};

const getAllCoursesByLecturerId = async (lecturerId: number) => {
  try {
    // check lecturer existence
    const lecturer = await prisma.user.findUnique({
      where: { id: lecturerId, isDestroyed: false },
    });
    if (!lecturer) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Lecturer not found!");
    }

    // get courses
    const courses = await prisma.course.findMany({
      where: {
        lecturerId,
        isDestroyed: false,
        status: COURSE_STATUS.PUBLISHED,
      },
      include: {
        thumbnail: { select: { fileUrl: true } },
        category: { select: { id: true, name: true } },
        lecturer: {
          select: {
            firstName: true,
            lastName: true,
            avatar: { select: { fileUrl: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return courses;
  } catch (error: any) {
    throw error;
  }
};

const getAllCoursesByCategoryId = async (categoryId: number) => {
  try {
    // check category existence
    const category = await prisma.courseCategory.findUnique({
      where: { id: categoryId, isDestroyed: false },
    });
    if (!category) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Category not found!");
    }

    // get courses
    const courses = await prisma.course.findMany({
      where: {
        categoryId,
        isDestroyed: false,
        status: COURSE_STATUS.PUBLISHED,
      },
      include: {
        thumbnail: { select: { fileUrl: true } },
        category: { select: { id: true, name: true } },
        lecturer: {
          select: {
            firstName: true,
            lastName: true,
            avatar: { select: { fileUrl: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return courses;
  } catch (error: any) {
    throw error;
  }
};

const getListCourses = async ({
  page,
  itemsPerPage,
  q,
  categoryId,
  level,
  price,
}: {
  page: number;
  itemsPerPage: number;
  q: string;
  categoryId?: number;
  level?: string;
  price?: string;
}) => {
  try {
    const currentPage = page ? Number(page) : DEFAULT_PAGE;
    const perPage = itemsPerPage
      ? Number(itemsPerPage)
      : DEFAULT_ITEMS_PER_PAGE;

    const skip = (currentPage - 1) * perPage;

    const where = {
      isDestroyed: false,
      status: COURSE_STATUS.PUBLISHED,
      ...(q && q !== "all"
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { lecturerName: { contains: q, mode: "insensitive" } },
              { overview: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(level && level !== "All Levels" ? { level } : {}),
      ...(price === "free"
        ? { price: 0 }
        : price === "paid"
          ? { price: { gt: 0 } }
          : {}),
    };

    const [courses, totalCourses] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          thumbnail: { select: { fileUrl: true } },
          category: { select: { id: true, name: true } },
          lecturer: {
            select: {
              firstName: true,
              lastName: true,
              avatar: { select: { fileUrl: true } },
            },
          },
        },
        orderBy: { name: "asc" },
        skip,
        take: perPage,
      }),
      prisma.course.count({ where }),
    ]);

    return { courses, totalCourses };
  } catch (error: any) {
    throw error;
  }
};

const getAdminCourses = async (
  {
    page,
    itemsPerPage,
    q,
    status,
  }: {
    page?: number;
    itemsPerPage?: number;
    q?: string;
    status?: "all" | "active" | "pending" | "rejected";
  },
  actorId: number,
) => {
  try {
    const actor = await prisma.user.findUnique({
      where: { id: actorId, isDestroyed: false },
      select: { role: true },
    });

    if (!actor || String(actor.role || "").toLowerCase() !== "admin") {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Only admin can access admin courses!",
      );
    }

    const currentPage = page ? Number(page) : DEFAULT_PAGE;
    const perPage = itemsPerPage
      ? Number(itemsPerPage)
      : DEFAULT_ITEMS_PER_PAGE;
    const skip = (currentPage - 1) * perPage;

    const normalizedStatus = String(status || "all").toLowerCase();

    const statusWhere =
      normalizedStatus === "active"
        ? { status: COURSE_STATUS.PUBLISHED }
        : normalizedStatus === "pending"
          ? {
              OR: [
                { status: COURSE_STATUS.PENDING },
                { status: COURSE_STATUS.DRAFT },
              ],
            }
          : normalizedStatus === "rejected"
            ? { status: COURSE_STATUS.REJECTED }
            : {};

    const where: any = {
      isDestroyed: false,
      ...statusWhere,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { lecturerName: { contains: q, mode: "insensitive" } },
              { overview: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [courses, total, activeCount, pendingCount, rejectedCount] =
      await Promise.all([
        prisma.course.findMany({
          where,
          include: {
            thumbnail: { select: { fileUrl: true } },
            category: { select: { id: true, name: true } },
            lecturer: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: perPage,
        }),
        prisma.course.count({ where }),
        prisma.course.count({
          where: {
            isDestroyed: false,
            status: COURSE_STATUS.PUBLISHED,
          },
        }),
        prisma.course.count({
          where: {
            isDestroyed: false,
            OR: [
              { status: COURSE_STATUS.PENDING },
              { status: COURSE_STATUS.DRAFT },
            ],
          },
        }),
        prisma.course.count({
          where: {
            isDestroyed: false,
            status: COURSE_STATUS.REJECTED,
          },
        }),
      ]);

    return {
      data: courses,
      tabs: {
        all: activeCount + pendingCount + rejectedCount,
        active: activeCount,
        pending: pendingCount,
        rejected: rejectedCount,
      },
      pagination: {
        page: currentPage,
        itemsPerPage: perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  } catch (error: any) {
    throw error;
  }
};

const getAdminCourseById = async (id: number, actorId: number) => {
  try {
    const actor = await prisma.user.findUnique({
      where: { id: actorId, isDestroyed: false },
      select: { role: true },
    });

    if (!actor || String(actor.role || "").toLowerCase() !== "admin") {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Only admin can access admin course detail!",
      );
    }

    const course = await prisma.course.findUnique({
      where: { id, isDestroyed: false },
      include: {
        thumbnail: { select: { fileUrl: true } },
        category: { select: { id: true, name: true } },
        lecturer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        modules: {
          where: { isDestroyed: false },
          orderBy: { createdAt: "asc" },
          include: {
            lessons: {
              where: { isDestroyed: false },
              orderBy: { createdAt: "asc" },
              include: {
                quizzes: {
                  where: { isDestroyed: false },
                  select: { id: true },
                },
                lessonFile: { select: { fileUrl: true, fileType: true } },
                lessonVideo: { select: { fileUrl: true, fileType: true } },
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Course not found!");
    }

    return course;
  } catch (error: any) {
    throw error;
  }
};

const getLecturerMyCourses = async (
  lecturerId: number,
  params: {
    page: number;
    itemsPerPage: number;
    status?: string;
    q?: string;
    sortBy?: string;
  },
) => {
  try {
    const skip = (params.page - 1) * params.itemsPerPage;
    const where = {
      lecturerId,
      isDestroyed: false,
      ...(params.status && params.status !== "all"
        ? { status: params.status }
        : {}),
      ...(params.q
        ? {
            OR: [
              { name: { contains: params.q, mode: "insensitive" } },
              { overview: { contains: params.q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      prisma.course.findMany({
        where,
        orderBy:
          params.sortBy === "updatedAt"
            ? { updatedAt: "desc" }
            : { createdAt: "desc" },
        skip,
        take: params.itemsPerPage,
      }),
      prisma.course.count({ where }),
    ]);

    return {
      data: rows,
      pagination: {
        page: params.page,
        itemsPerPage: params.itemsPerPage,
        total,
        totalPages: Math.ceil(total / params.itemsPerPage),
      },
    };
  } catch (error: any) {
    throw error;
  }
};

export const courseService = {
  createCourseCategory,
  getAllCourseCategories,
  getCourseStudentState,

  createCourseFaq,
  getFaqsByCourseId,
  getCourseFaqById,

  createCourse,
  updateCourse,
  deleteCourse,
  approveCourse,
  rejectCourse,
  getListCourses,
  getAdminCourses,
  getAdminCourseById,
  getLecturerMyCourses,
  getCourseById,
  getCourseByIdForLecturer,
  getListLecturersByStudentId,
  getAllCoursesByStudentId,
  getAllCoursesByLecturerId,
  getAllCoursesByCategoryId,
};
