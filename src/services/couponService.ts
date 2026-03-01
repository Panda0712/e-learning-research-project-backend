import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import {
    DEFAULT_ITEMS_PER_PAGE,
    DEFAULT_PAGE,
} from "@/utils/constants.js";
import { StatusCodes } from "http-status-codes";

// ============ COUPON CATEGORY SERVICES ============

const createCouponCategory = async (data: { name: string; slug: string }) => {
  try {
    // check category exits
    const category = await prisma.couponCategory.findUnique({
      where: {
        slug: data.slug,
        isDestroyed: false,
      },
    });

    if (category) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Coupon category already exists!"
      );
    }

    // create category
    const createdCategory = await prisma.couponCategory.create({
      data: {
        name: data.name,
        slug: data.slug,
      },
    });

    return createdCategory;
  } catch (error: any) {
    throw new Error(error);
  }
};

const getAllCouponCategories = async () => {
  try {
    return await prisma.couponCategory.findMany({
      where: { isDestroyed: false },
      include: {
        coupons: {
          where: { isDestroyed: false },
        },
      },
    });
  } catch (error: any) {
    throw new Error(error);
  }
};

const getCouponCategoryById = async (id: number) => {
  try {
    const category = await prisma.couponCategory.findUnique({
      where: {
        id,
        isDestroyed: false,
      },
      include: {
        coupons: {
          where: { isDestroyed: false },
        },
      },
    });

    if (!category) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Coupon category not found!");
    }

    return category;
  } catch (error: any) {
    throw new Error(error);
  }
};

const updateCouponCategory = async (
  id: number,
  data: { name?: string; slug?: string }
) => {
  try {
    // check category existence
    const category = await prisma.couponCategory.findUnique({
      where: { id, isDestroyed: false },
    });

    if (!category) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Coupon category not found!");
    }

    // check slug uniqueness if slug is being updated
    if (data.slug && data.slug !== category.slug) {
      const existingSlug = await prisma.couponCategory.findUnique({
        where: { slug: data.slug },
      });

      if (existingSlug) {
        throw new ApiError(StatusCodes.CONFLICT, "Slug already exists!");
      }
    }

    const updated = await prisma.couponCategory.update({
      where: { id },
      data: {
        name: data.name || category.name,
        slug: data.slug || category.slug,
        updatedAt: new Date(),
      },
    });

    return updated;
  } catch (error: any) {
    throw new Error(error);
  }
};

const deleteCouponCategory = async (id: number) => {
  try {
    // check category existence
    const category = await prisma.couponCategory.findUnique({
      where: { id, isDestroyed: false },
    });

    if (!category) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Coupon category not found!");
    }

    // soft delete
    await prisma.couponCategory.update({
      where: { id },
      data: { isDestroyed: true },
    });

    return { message: "Coupon category deleted successfully!" };
  } catch (error: any) {
    throw new Error(error);
  }
};

// ============ COUPON SERVICES ============

const createCoupon = async (data: any) => {
  try {
    // check coupon code uniqueness
    const existingCoupon = await prisma.coupon.findUnique({
      where: {
        code: data.code,
        isDestroyed: false,
      },
    });

    if (existingCoupon) {
      throw new ApiError(StatusCodes.CONFLICT, "Coupon code already exists!");
    }

    // check if category exists
    if (data.categoryId) {
      const category = await prisma.couponCategory.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Coupon category not found!");
      }
    }

    const newCoupon = await prisma.coupon.create({
      data: {
        name: data.name,
        description: data.description || null,
        status: data.status || "active",
        customerGroup: data.customerGroup || null,
        code: data.code,
        categoryId: data.categoryId || null,
        quantity: data.quantity || null,
        usesPerCustomer: data.usesPerCustomer || null,
        priority: data.priority || "normal",
        actions: data.actions || null,
        type: data.type || "percentage", // percentage | fixed
        amount: data.amount || 0,
        startingDate: data.startingDate || null,
        startingTime: data.startingTime || null,
        endingDate: data.endingDate || null,
        endingTime: data.endingTime || null,
        isUnlimited: data.isUnlimited || false,
      },
      include: {
        category: true,
      },
    });

    return newCoupon;
  } catch (error: any) {
    throw new Error(error);
  }
};

const getAllCoupons = async (filters: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  try {
    const page = filters.page || DEFAULT_PAGE;
    const limit = filters.limit || DEFAULT_ITEMS_PER_PAGE;
    const skip = (page - 1) * limit;

    const whereCondition: any = { isDestroyed: false };

    if (filters.status) {
      whereCondition.status = filters.status;
    }

    const total = await prisma.coupon.count({
      where: whereCondition,
    });

    const coupons = await prisma.coupon.findMany({
      where: whereCondition,
      include: {
        category: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return {
      data: coupons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    throw new Error(error);
  }
};

const getCouponById = async (id: number) => {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: {
        id,
        isDestroyed: false,
      },
      include: {
        category: true,
      },
    });

    if (!coupon) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Coupon not found!");
    }

    return coupon;
  } catch (error: any) {
    throw new Error(error);
  }
};

const getCouponByCode = async (code: string) => {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: {
        code,
        isDestroyed: false,
      },
      include: {
        category: true,
      },
    });

    if (!coupon) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Coupon not found!");
    }

    return coupon;
  } catch (error: any) {
    throw new Error(error);
  }
};

const updateCoupon = async (id: number, data: any) => {
  try {
    // check coupon existence
    const coupon = await prisma.coupon.findUnique({
      where: { id, isDestroyed: false },
    });

    if (!coupon) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Coupon not found!");
    }

    // check code uniqueness if code is being updated
    if (data.code && data.code !== coupon.code) {
      const existingCoupon = await prisma.coupon.findUnique({
        where: { code: data.code },
      });

      if (existingCoupon) {
        throw new ApiError(
          StatusCodes.CONFLICT,
          "Coupon code already exists!"
        );
      }
    }

    // check category existence if categoryId is provided
    if (data.categoryId && data.categoryId !== coupon.categoryId) {
      const category = await prisma.couponCategory.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Coupon category not found!");
      }
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        name: data.name || coupon.name,
        description: data.description !== undefined ? data.description : coupon.description,
        status: data.status || coupon.status,
        customerGroup: data.customerGroup !== undefined ? data.customerGroup : coupon.customerGroup,
        code: data.code || coupon.code,
        categoryId: data.categoryId || coupon.categoryId,
        quantity: data.quantity !== undefined ? data.quantity : coupon.quantity,
        usesPerCustomer: data.usesPerCustomer !== undefined ? data.usesPerCustomer : coupon.usesPerCustomer,
        priority: data.priority || coupon.priority,
        actions: data.actions !== undefined ? data.actions : coupon.actions,
        type: data.type || coupon.type,
        amount: data.amount !== undefined ? data.amount : coupon.amount,
        startingDate: data.startingDate !== undefined ? data.startingDate : coupon.startingDate,
        startingTime: data.startingTime || coupon.startingTime,
        endingDate: data.endingDate !== undefined ? data.endingDate : coupon.endingDate,
        endingTime: data.endingTime || coupon.endingTime,
        isUnlimited: data.isUnlimited !== undefined ? data.isUnlimited : coupon.isUnlimited,
        updatedAt: new Date(),
      },
      include: {
        category: true,
      },
    });

    return updated;
  } catch (error: any) {
    throw new Error(error);
  }
};

const deleteCoupon = async (id: number) => {
  try {
    // check coupon existence
    const coupon = await prisma.coupon.findUnique({
      where: { id, isDestroyed: false },
    });

    if (!coupon) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Coupon not found!");
    }

    // soft delete
    await prisma.coupon.update({
      where: { id },
      data: { isDestroyed: true },
    });

    return { message: "Coupon deleted successfully!" };
  } catch (error: any) {
    throw new Error(error);
  }
};

const verifyCouponCode = async (code: string) => {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: {
        code,
        isDestroyed: false,
      },
      include: {
        category: true,
      },
    });

    if (!coupon) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Coupon not found!");
    }

    // check if coupon is active
    if (coupon.status !== "active") {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Coupon is ${coupon.status}!`
      );
    }

    // check if coupon is within valid date range
    const now = new Date();
    if (coupon.startingDate && new Date(coupon.startingDate) > now) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Coupon is not yet available!"
      );
    }

    if (coupon.endingDate && new Date(coupon.endingDate) < now) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Coupon has expired!");
    }

    // check quantity if not unlimited
    if (!coupon.isUnlimited && coupon.quantity !== null && coupon.quantity <= 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Coupon is out of stock!");
    }

    return {
      isValid: true,
      coupon,
      message: "Coupon is valid!",
    };
  } catch (error: any) {
    throw new Error(error);
  }
};

export const couponService = {
  // Category services
  createCouponCategory,
  getAllCouponCategories,
  getCouponCategoryById,
  updateCouponCategory,
  deleteCouponCategory,
  // Coupon services
  createCoupon,
  getAllCoupons,
  getCouponById,
  getCouponByCode,
  updateCoupon,
  deleteCoupon,
  verifyCouponCode,
};
