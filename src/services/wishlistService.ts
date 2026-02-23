import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from "@/utils/constants.js";
import { StatusCodes } from "http-status-codes";

const createWishlist = async (data: {
  userId: number;
  courseId: number;
  courseThumbnail?: string;
  courseName?: string;
  lecturer?: string;
}) => {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: data.userId, isDestroyed: false },
    });

    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: data.courseId, isDestroyed: false },
    });

    if (!course) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Course not found!");
    }

    // Check if already in wishlist
    const existingWishlist = await prisma.wishlist.findFirst({
      where: {
        userId: data.userId,
        courseId: data.courseId,
        isDestroyed: false,
      },
    });

    if (existingWishlist) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Course already in wishlist!",
      );
    }

    const newWishlist = await prisma.wishlist.create({
      data: {
        userId: data.userId,
        courseId: data.courseId,
        courseThumbnail: data.courseThumbnail,
        courseName: data.courseName || course.name,
        lecturer: data.lecturer || course.lecturerName,
      },
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

    return newWishlist;
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

const getWishlistsByUserId = async (params: {
  userId: number;
  page?: number;
  limit?: number;
}) => {
  try {
    const page = params.page || DEFAULT_PAGE;
    const limit = params.limit || DEFAULT_ITEMS_PER_PAGE;
    const skip = (page - 1) * limit;

    const where = {
      userId: params.userId,
      isDestroyed: false,
    };

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

    const updatedWishlist = await prisma.wishlist.update({
      where: { id },
      data: {
        courseThumbnail: data.courseThumbnail,
        courseName: data.courseName,
        lecturer: data.lecturer,
      },
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

const deleteWishlist = async (id: number) => {
  try {
    const wishlist = await prisma.wishlist.findUnique({
      where: { id, isDestroyed: false },
    });

    if (!wishlist) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Wishlist item not found!");
    }

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
