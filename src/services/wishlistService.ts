import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from "@/utils/constants.js";
import { StatusCodes } from "http-status-codes";

const createWishlist = async ({
  userId,
  courseId,
}: {
  userId: number;
  courseId: number;
}) => {
  try {
    const [user, course, purchased] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId, isDestroyed: false } }),
      prisma.course.findUnique({
        where: { id: courseId, isDestroyed: false, status: "published" },
        include: { thumbnail: { select: { fileUrl: true } } },
      }),
      prisma.orderItem.findFirst({
        where: {
          courseId,
          isDestroyed: false,
          order: { studentId: userId, isSuccess: true, isDestroyed: false },
        },
        select: { id: true },
      }),
    ]);

    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
    if (!course) throw new ApiError(StatusCodes.NOT_FOUND, "Course not found!");
    if (purchased)
      throw new ApiError(StatusCodes.CONFLICT, "Course already purchased!");

    return await prisma.wishlist.create({
      data: {
        userId,
        courseId,
        courseThumbnail: course.thumbnail?.fileUrl ?? null,
        courseName: course.name,
        lecturer: course.lecturerName ?? null,
      },
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      throw new ApiError(StatusCodes.CONFLICT, "Course already in wishlist!");
    }
    throw error;
  }
};

const getWishlistsByUserId = async ({
  userId,
  page = 1,
  limit = 10,
}: {
  userId: number;
  page?: number;
  limit?: number;
}) => {
  try {
    const skip = (page - 1) * limit;
    const where = { userId, isDestroyed: false };
    const [data, total] = await Promise.all([
      prisma.wishlist.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          course: {
            select: {
              id: true,
              price: true,
              totalStudents: true,
              thumbnail: { select: { fileUrl: true } },
              reviews: {
                where: { isDestroyed: false },
                select: { rating: true },
              },
            },
          },
        },
      }),
      prisma.wishlist.count({ where }),
    ]);
    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error) {
    throw error;
  }
};

const getWishlistById = async (id: number) => {
  try {
    const wishlist = await prisma.wishlist.findUnique({
      where: { id, isDestroyed: false },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!wishlist) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Wishlist item not found!");
    }

    return wishlist;
  } catch (error) {
    throw error;
  }
};

const getAllWishlists = async (params: {
  page?: number;
  limit?: number;
  userId?: number;
}) => {
  try {
    const page = params.page || DEFAULT_PAGE;
    const limit = params.limit || DEFAULT_ITEMS_PER_PAGE;
    const skip = (page - 1) * limit;

    const where: any = { isDestroyed: false };

    if (params.userId) {
      where.userId = params.userId;
    }

    const [wishlists, total] = await Promise.all([
      prisma.wishlist.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.wishlist.count({ where }),
    ]);

    return {
      data: wishlists,
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

const checkCourseInWishlist = async (userId: number, courseId: number) => {
  try {
    const wishlist = await prisma.wishlist.findFirst({
      where: {
        userId,
        courseId,
        isDestroyed: false,
      },
    });

    return {
      inWishlist: !!wishlist,
      wishlistId: wishlist?.id || null,
    };
  } catch (error) {
    throw error;
  }
};

const updateWishlist = async (
  id: number,
  data: {
    courseThumbnail?: string;
    courseName?: string;
    lecturer?: string;
  },
) => {
  try {
    const wishlist = await prisma.wishlist.findUnique({
      where: { id, isDestroyed: false },
    });

    if (!wishlist) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Wishlist item not found!");
    }

    const updateData: any = {};
    if (data.courseThumbnail !== undefined)
      updateData.courseThumbnail = data.courseThumbnail;
    if (data.courseName !== undefined) updateData.courseName = data.courseName;
    if (data.lecturer !== undefined) updateData.lecturer = data.lecturer;

    const updatedWishlist = await prisma.wishlist.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return updatedWishlist;
  } catch (error) {
    throw error;
  }
};

const deleteWishlist = async (id: number, userId: number) => {
  try {
    const found = await prisma.wishlist.findUnique({
      where: { id, isDestroyed: false },
    });
    if (!found)
      throw new ApiError(StatusCodes.NOT_FOUND, "Wishlist item not found!");
    if (found.userId !== userId)
      throw new ApiError(StatusCodes.FORBIDDEN, "You are not allowed.");
    await prisma.wishlist.update({
      where: { id },
      data: { isDestroyed: true },
    });
    return { message: "Wishlist item deleted successfully!" };
  } catch (error) {
    throw error;
  }
};

const deleteWishlistByCourse = async (userId: number, courseId: number) => {
  try {
    const wishlist = await prisma.wishlist.findFirst({
      where: {
        userId,
        courseId,
        isDestroyed: false,
      },
    });

    if (!wishlist) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Wishlist item not found!");
    }

    await prisma.wishlist.update({
      where: { id: wishlist.id },
      data: { isDestroyed: true },
    });

    return { message: "Wishlist item deleted successfully!" };
  } catch (error) {
    throw error;
  }
};

export const wishlistService = {
  createWishlist,
  getWishlistById,
  getAllWishlists,
  getWishlistsByUserId,
  checkCourseInWishlist,
  updateWishlist,
  deleteWishlist,
  deleteWishlistByCourse,
};
