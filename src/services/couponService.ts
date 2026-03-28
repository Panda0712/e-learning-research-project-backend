import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from "@/utils/constants.js";
import { StatusCodes } from "http-status-codes";

const calcAmountFromDiscount = ({
  discount,
  discountUnit,
  minOrderValue,
  maxValue,
}: {
  discount: number;
  discountUnit: "amount" | "percent";
  minOrderValue?: number | null;
  maxValue?: number | null;
}) => {
  const normalizedDiscount = Number(discount) || 0;
  const normalizedMinOrder = Number(minOrderValue) || 0;

  const baseAmount =
    discountUnit === "percent"
      ? (normalizedMinOrder > 0
          ? (normalizedMinOrder * normalizedDiscount) / 100
          : normalizedDiscount)
      : normalizedDiscount;

  if (typeof maxValue === "number" && maxValue >= 0) {
    return Number(Math.min(baseAmount, maxValue).toFixed(2));
  }

  return Number(baseAmount.toFixed(2));
};

const resolveCouponPricing = ({
  discount,
  amount,
  discountUnit,
  minOrderValue,
  maxValue,
}: {
  discount?: number | null;
  amount?: number | null;
  discountUnit?: string | null;
  minOrderValue?: number | null;
  maxValue?: number | null;
}) => {
  const normalizedUnit =
    discountUnit === "amount" || discountUnit === "fixed"
      ? "amount"
      : discountUnit === "percent" || discountUnit === "percentage"
        ? "percent"
        : "percent";

  const normalizedDiscount =
    discount !== undefined && discount !== null
      ? Number(discount)
      : amount !== undefined && amount !== null
        ? Number(amount)
        : null;

  const normalizedAmount =
    amount !== undefined && amount !== null
      ? Number(amount)
      : normalizedDiscount !== null
        ? calcAmountFromDiscount({
            discount: normalizedDiscount,
            discountUnit: normalizedUnit,
            minOrderValue,
            maxValue,
          })
        : null;

  return {
    discount: normalizedDiscount,
    amount: normalizedAmount,
    discountUnit: normalizedUnit,
  };
};

const normalizeCouponResponse = (coupon: any) => {
  return {
    ...coupon,
    discount: coupon?.discount ?? null,
    discountUnit: coupon?.discountUnit ?? "percent",
    usageLimit: coupon?.usageLimit ?? null,
    minOrderValue: coupon?.minOrderValue ?? null,
    maxValue: coupon?.maxValue ?? null,
  };
};

const normalizeDateInput = (value: unknown): Date | null => {
  if (value === undefined || value === null || value === "") return null;
  if (value instanceof Date) return value;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    // Accept date-only string from UI and convert to full ISO datetime.
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return new Date(`${trimmed}T00:00:00.000Z`);
    }

    return new Date(trimmed);
  }

  return new Date(value as string);
};

// ============ COUPON CATEGORY SERVICES ============

const createCouponCategory = async (data: { name: string; slug: string }) => {
  try {
    // Slug is globally unique in DB. If the slug exists and was soft-deleted,
    // restore that row instead of creating a new one and hitting unique errors.
    const existingBySlug = await prisma.couponCategory.findUnique({
      where: { slug: data.slug },
    });

    if (existingBySlug && !existingBySlug.isDestroyed) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "Coupon category already exists!",
      );
    }

    if (existingBySlug && existingBySlug.isDestroyed) {
      return await prisma.couponCategory.update({
        where: { id: existingBySlug.id },
        data: {
          name: data.name,
          isDestroyed: false,
          updatedAt: new Date(),
        },
      });
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
    throw error;
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
    throw error;
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
    throw error;
  }
};

const updateCouponCategory = async (
  id: number,
  data: { name?: string; slug?: string },
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

      if (existingSlug && existingSlug.id !== id && !existingSlug.isDestroyed) {
        throw new ApiError(StatusCodes.CONFLICT, "Slug already exists!");
      }

      if (existingSlug && existingSlug.id !== id && existingSlug.isDestroyed) {
        throw new ApiError(
          StatusCodes.CONFLICT,
          "Slug already exists in archived category. Please choose another slug.",
        );
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
    throw error;
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
    throw error;
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

    const pricing = resolveCouponPricing({
      discount: data.discount,
      amount: data.amount,
      discountUnit: data.discountUnit || data.type,
      minOrderValue: data.minOrderValue ?? null,
      maxValue: data.maxValue ?? null,
    });
    const normalizedStartingDate = normalizeDateInput(data.startingDate);
    const normalizedEndingDate = normalizeDateInput(data.endingDate);

    const newCoupon = await prisma.coupon.create({
      // Support old payload names while storing new schema fields.
      // `quantity` -> usageLimit, `type` -> discountUnit.
      data: {
        name: data.name,
        description: data.description || null,
        status: data.status,
        code: data.code,
        categoryId: data.categoryId || null,
        discount: pricing.discount,
        discountUnit: pricing.discountUnit,
        usageLimit: data.usageLimit ?? data.quantity ?? null,
        minOrderValue: data.minOrderValue ?? null,
        maxValue: data.maxValue ?? null,
        amount: pricing.amount,
        startingDate: normalizedStartingDate,
        startingTime: data.startingTime || null,
        endingDate: normalizedEndingDate,
        endingTime: data.endingTime || null,
      },
      include: {
        category: true,
      },
    });

    return normalizeCouponResponse(newCoupon);
  } catch (error: any) {
    throw error;
  }
};

const getAllCoupons = async (filters: {
  page?: number;
  limit?: number;
  itemsPerPage?: number;
  status?: string;
}) => {
  try {
    const page = filters.page || DEFAULT_PAGE;
    const limit =
      filters.itemsPerPage || filters.limit || DEFAULT_ITEMS_PER_PAGE;
    const skip = (page - 1) * limit;

    const whereCondition: any = { isDestroyed: false };

    if (filters.status && filters.status !== "all")
      whereCondition.status = filters.status;

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
      data: coupons.map((coupon) => ({
        ...normalizeCouponResponse(coupon),
        redemptions: 0,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    throw error;
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

    return normalizeCouponResponse(coupon);
  } catch (error: any) {
    throw error;
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

    return normalizeCouponResponse(coupon);
  } catch (error: any) {
    throw error;
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
        where: { code: data.code, isDestroyed: false },
      });

      if (existingCoupon) {
        throw new ApiError(StatusCodes.CONFLICT, "Coupon code already exists!");
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

    const pricing = resolveCouponPricing({
      discount:
        data.discount !== undefined ? Number(data.discount) : coupon.discount,
      amount: data.amount !== undefined ? Number(data.amount) : coupon.amount,
      discountUnit:
        data.discountUnit !== undefined
          ? data.discountUnit
          : (coupon.discountUnit as string | null),
      minOrderValue: data.minOrderValue,
      maxValue: data.maxValue,
    });
    const normalizedStartingDate =
      data.startingDate !== undefined
        ? normalizeDateInput(data.startingDate)
        : coupon.startingDate;
    const normalizedEndingDate =
      data.endingDate !== undefined
        ? normalizeDateInput(data.endingDate)
        : coupon.endingDate;

    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        name: data.name || coupon.name,
        description:
          data.description !== undefined
            ? data.description
            : coupon.description,
        status: data.status || coupon.status,
        code: data.code || coupon.code,
        categoryId: data.categoryId || coupon.categoryId,
        usageLimit:
          data.usageLimit !== undefined
            ? data.usageLimit
            : data.quantity !== undefined
              ? data.quantity
              : coupon.usageLimit,
        discount: pricing.discount,
        discountUnit: pricing.discountUnit,
        minOrderValue:
          data.minOrderValue !== undefined
            ? data.minOrderValue
            : coupon.minOrderValue,
        maxValue:
          data.maxValue !== undefined ? data.maxValue : coupon.maxValue,
        amount: pricing.amount,
        startingDate: normalizedStartingDate,
        startingTime:
          data.startingTime !== undefined
            ? data.startingTime
            : coupon.startingTime,
        endingDate: normalizedEndingDate,
        endingTime:
          data.endingTime !== undefined ? data.endingTime : coupon.endingTime,
        updatedAt: new Date(),
      },
      include: {
        category: true,
      },
    });

    return normalizeCouponResponse(updated);
  } catch (error: any) {
    throw error;
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
    throw error;
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
        `Coupon is ${coupon.status}!`,
      );
    }

    // check if coupon is within valid date range
    const now = new Date();
    if (coupon.startingDate && new Date(coupon.startingDate) > now) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Coupon is not yet available!",
      );
    }

    if (coupon.endingDate && new Date(coupon.endingDate) < now) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Coupon has expired!");
    }

    // check quantity if not unlimited
    if (
      coupon.usageLimit !== null &&
      coupon.usageLimit !== undefined &&
      coupon.usageLimit <= 0
    ) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Coupon is out of stock!");
    }

    return {
      isValid: true,
      coupon: normalizeCouponResponse(coupon),
      message: "Coupon is valid!",
    };
  } catch (error: any) {
    throw error;
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
