import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from "@/utils/constants.js";
import { StatusCodes } from "http-status-codes";
import { notificationService } from "./notificationService.js";

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
          : 0)
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
            ...(minOrderValue !== undefined ? { minOrderValue } : {}),
            ...(maxValue !== undefined ? { maxValue } : {}),
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
    scope: coupon?.scope ?? "ALL_COURSES",
    scopeCategoryId: coupon?.scopeCategoryId ?? null,
    discount: coupon?.discount ?? null,
    discountUnit: coupon?.discountUnit ?? "percent",
    usageLimit: coupon?.usageLimit ?? null,
    usedCount: coupon?.usedCount ?? 0,
    usagePerUser: coupon?.usagePerUser ?? null,
    minOrderValue: coupon?.minOrderValue ?? null,
    maxValue: coupon?.maxValue ?? null,
    remainingUsages:
      typeof coupon?.usageLimit === "number"
        ? Math.max(0, Number(coupon.usageLimit || 0) - Number(coupon.usedCount || 0))
        : null,
  };
};

const resolveCouponScope = (payload: any) => {
  if (payload?.scope) {
    const normalizedScope = String(payload.scope).toUpperCase();
    if (
      normalizedScope !== "ALL_COURSES" &&
      normalizedScope !== "CATEGORY" &&
      normalizedScope !== "SPECIFIC_COURSE"
    ) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid coupon scope!");
    }

    return normalizedScope;
  }
  if (payload?.courseId) return "SPECIFIC_COURSE";
  if (payload?.scopeCategoryId) return "CATEGORY";
  return "ALL_COURSES";
};

const ensureCouponScopeTargets = async ({
  scope,
  courseId,
  scopeCategoryId,
}: {
  scope: string;
  courseId?: number | null;
  scopeCategoryId?: number | null;
}) => {
  if (scope === "SPECIFIC_COURSE") {
    if (!courseId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "courseId is required when scope is SPECIFIC_COURSE.",
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId, isDestroyed: false },
      select: { id: true },
    });

    if (!course) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Target course not found!");
    }
  }

  if (scope === "CATEGORY") {
    if (!scopeCategoryId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "scopeCategoryId is required when scope is CATEGORY.",
      );
    }

    const courseCategory = await prisma.courseCategory.findUnique({
      where: { id: scopeCategoryId, isDestroyed: false },
      select: { id: true },
    });

    if (!courseCategory) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Target course category not found!",
      );
    }
  }
};

const ensureCouponIsUsableNow = (
  coupon: any,
  orderTotal?: number,
) => {
  if (!coupon) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Coupon not found!");
  }

  if (coupon.status !== "active") {
    throw new ApiError(StatusCodes.BAD_REQUEST, `Coupon is ${coupon.status}!`);
  }

  const now = new Date();
  if (coupon.startingDate && new Date(coupon.startingDate) > now) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Coupon is not yet available!");
  }

  if (coupon.endingDate && new Date(coupon.endingDate) < now) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Coupon has expired!");
  }

  if (
    coupon.usageLimit !== null &&
    coupon.usageLimit !== undefined &&
    Number(coupon.usedCount || 0) >= Number(coupon.usageLimit)
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Coupon has reached its usage limit!",
    );
  }

  if (
    typeof orderTotal === "number" &&
    coupon.minOrderValue !== null &&
    coupon.minOrderValue !== undefined &&
    orderTotal < Number(coupon.minOrderValue)
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Minimum order value for this coupon is ${Number(coupon.minOrderValue).toLocaleString()}!`,
    );
  }
};

const resolveNextTimedStatus = (coupon: any, now: Date) => {
  const currentStatus = String(coupon?.status || "").toLowerCase();
  const startAt = coupon?.startingDate ? new Date(coupon.startingDate) : null;
  const endAt = coupon?.endingDate ? new Date(coupon.endingDate) : null;

  if (
    currentStatus === "active" &&
    endAt &&
    !Number.isNaN(endAt.getTime()) &&
    endAt <= now
  ) {
    return "expired";
  }

  if (
    currentStatus === "scheduled" &&
    startAt &&
    !Number.isNaN(startAt.getTime()) &&
    startAt <= now
  ) {
    if (endAt && !Number.isNaN(endAt.getTime()) && endAt <= now) {
      return "expired";
    }

    return "active";
  }

  return coupon.status;
};

const syncSingleCouponStatusByTime = async (coupon: any) => {
  const nextStatus = resolveNextTimedStatus(coupon, new Date());
  if (nextStatus === coupon.status) return coupon;

  await prisma.coupon.update({
    where: { id: coupon.id },
    data: {
      status: nextStatus,
      updatedAt: new Date(),
    },
  });

  return {
    ...coupon,
    status: nextStatus,
    updatedAt: new Date(),
  };
};

const syncCouponsStatusByTime = async () => {
  const now = new Date();

  await prisma.coupon.updateMany({
    where: {
      isDestroyed: false,
      status: "scheduled",
      startingDate: {
        lte: now,
      },
      OR: [{ endingDate: null }, { endingDate: { gt: now } }],
    },
    data: {
      status: "active",
      updatedAt: now,
    },
  });

  await prisma.coupon.updateMany({
    where: {
      isDestroyed: false,
      status: {
        in: ["active", "scheduled"],
      },
      endingDate: {
        lte: now,
      },
    },
    data: {
      status: "expired",
      updatedAt: now,
    },
  });
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

    const scope = resolveCouponScope(data);
    const scopedCourseId =
      data.courseId !== undefined && data.courseId !== null
        ? Number(data.courseId)
        : null;
    const scopedCategoryId =
      data.scopeCategoryId !== undefined && data.scopeCategoryId !== null
        ? Number(data.scopeCategoryId)
        : data.courseCategoryId !== undefined && data.courseCategoryId !== null
          ? Number(data.courseCategoryId)
          : null;

    await ensureCouponScopeTargets({
      scope,
      courseId: scopedCourseId,
      scopeCategoryId: scopedCategoryId,
    });

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
        scope,
        courseId: scope === "SPECIFIC_COURSE" ? scopedCourseId : null,
        scopeCategoryId: scope === "CATEGORY" ? scopedCategoryId : null,
        categoryId: data.categoryId || null,
        discount: pricing.discount,
        discountUnit: pricing.discountUnit,
        usageLimit: data.usageLimit ?? data.quantity ?? null,
        usedCount: 0,
        usagePerUser:
          data.usagePerUser !== undefined ? Number(data.usagePerUser) : null,
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

    const users = await prisma.user.findMany({
      where: { isDestroyed: false },
      select: { id: true },
    });

    await notificationService.createAndDispatchNotificationsForUsers(
      {
        userIds: users.map((user) => user.id),
        title: "New discount coupon",
        message: `Coupon ${newCoupon.code} is now available for use.`,
        type: "coupon",
        relatedId: newCoupon.id,
      },
      { dedupe: true },
    );

    return newCoupon;
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
    await syncCouponsStatusByTime();

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
        _count: {
          select: {
            usages: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return {
      data: coupons.map((coupon) => ({
        ...normalizeCouponResponse(coupon),
        redemptions: coupon._count?.usages || 0,
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
    const existingCoupon = await prisma.coupon.findUnique({
      where: {
        id,
        isDestroyed: false,
      },
      include: {
        category: true,
      },
    });

    if (!existingCoupon) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Coupon not found!");
    }

    const coupon = await syncSingleCouponStatusByTime(existingCoupon);

    return normalizeCouponResponse(coupon);
  } catch (error: any) {
    throw error;
  }
};

const getCouponByCode = async (code: string) => {
  try {
    const existingCoupon = await prisma.coupon.findUnique({
      where: {
        code,
        isDestroyed: false,
      },
      include: {
        category: true,
      },
    });

    if (!existingCoupon) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Coupon not found!");
    }

    const coupon = await syncSingleCouponStatusByTime(existingCoupon);

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

    const scope =
      data.scope !== undefined
        ? resolveCouponScope(data)
        : resolveCouponScope({
            scope: coupon.scope,
            courseId: coupon.courseId,
            scopeCategoryId: coupon.scopeCategoryId,
          });
    const scopedCourseId =
      data.courseId !== undefined
        ? data.courseId !== null
          ? Number(data.courseId)
          : null
        : coupon.courseId;
    const scopedCategoryId =
      data.scopeCategoryId !== undefined
        ? data.scopeCategoryId !== null
          ? Number(data.scopeCategoryId)
          : null
        : data.courseCategoryId !== undefined
          ? data.courseCategoryId !== null
            ? Number(data.courseCategoryId)
            : null
          : coupon.scopeCategoryId;

    await ensureCouponScopeTargets({
      scope,
      courseId: scopedCourseId,
      scopeCategoryId: scopedCategoryId,
    });

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
        scope,
        courseId: scope === "SPECIFIC_COURSE" ? scopedCourseId : null,
        scopeCategoryId: scope === "CATEGORY" ? scopedCategoryId : null,
        categoryId: data.categoryId || coupon.categoryId,
        usageLimit:
          data.usageLimit !== undefined
            ? data.usageLimit
            : data.quantity !== undefined
              ? data.quantity
              : coupon.usageLimit,
        usagePerUser:
          data.usagePerUser !== undefined
            ? data.usagePerUser
            : coupon.usagePerUser,
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

const verifyCouponCode = async (code: string, orderTotal?: number) => {
  try {
    const existingCoupon = await prisma.coupon.findFirst({
      where: {
        code,
        isDestroyed: false,
      },
      include: {
        category: true,
      },
    });

    if (!existingCoupon) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Coupon not found!");
    }

    const coupon = await syncSingleCouponStatusByTime(existingCoupon);

    ensureCouponIsUsableNow(coupon, orderTotal);

    return {
      isValid: true,
      coupon: normalizeCouponResponse(coupon),
      message: "Coupon is valid!",
    };
  } catch (error: any) {
    throw error;
  }
};

const applyCouponToOrder = async ({
  couponCode,
  studentId,
  items,
  originalTotal,
}: {
  couponCode: string;
  studentId: number;
  items: Array<{ courseId: number; price: number; courseCategoryId?: number | null }>;
  originalTotal: number;
}) => {
  const existingCoupon = await prisma.coupon.findFirst({
    where: {
      code: couponCode,
      isDestroyed: false,
    },
    include: {
      course: {
        select: { id: true },
      },
    },
  });

  if (!existingCoupon) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Coupon not found!");
  }

  const coupon = await syncSingleCouponStatusByTime(existingCoupon);

  ensureCouponIsUsableNow(coupon, originalTotal);

  if (coupon.usagePerUser !== null && coupon.usagePerUser !== undefined) {
    const userUsageCount = await prisma.couponUsage.count({
      where: {
        couponId: coupon.id,
        userId: studentId,
      },
    });

    if (userUsageCount >= coupon.usagePerUser) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "You have reached the usage limit for this coupon!",
      );
    }
  }

  let eligibleItems = items;

  if (coupon.scope === "SPECIFIC_COURSE") {
    if (!coupon.courseId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "This coupon is misconfigured: missing target course.",
      );
    }

    eligibleItems = items.filter((item) => item.courseId === coupon.courseId);

    if (eligibleItems.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "This coupon is only applicable to a specific course not in your order!",
      );
    }
  } else if (coupon.scope === "CATEGORY") {
    if (!coupon.scopeCategoryId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "This coupon is misconfigured: missing target category.",
      );
    }

    eligibleItems = items.filter(
      (item) => item.courseCategoryId === coupon.scopeCategoryId,
    );

    if (eligibleItems.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "No items in your order qualify for this coupon!",
      );
    }
  }

  const eligibleTotal = eligibleItems.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0,
  );

  if (
    coupon.minOrderValue !== null &&
    coupon.minOrderValue !== undefined &&
    eligibleTotal < Number(coupon.minOrderValue)
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Minimum order value for this coupon is ${Number(coupon.minOrderValue).toLocaleString()}!`,
    );
  }

  let discountAmount = 0;

  if (coupon.discountUnit === "percent") {
    discountAmount =
      (eligibleTotal * Number(coupon.discount || coupon.amount || 0)) / 100;

    if (coupon.maxValue !== null && coupon.maxValue !== undefined) {
      discountAmount = Math.min(discountAmount, Number(coupon.maxValue));
    }
  } else {
    discountAmount = Math.min(
      Number(coupon.amount || coupon.discount || 0),
      eligibleTotal,
    );
  }

  discountAmount = Number(discountAmount.toFixed(2));

  return {
    coupon,
    discountAmount,
    eligibleItemIds: eligibleItems.map((item) => item.courseId),
    eligibleTotal,
  };
};

const previewCoupon = async ({
  code,
  courseIds,
  studentId,
}: {
  code: string;
  courseIds: number[];
  studentId: number;
}) => {
  const courses = await prisma.course.findMany({
    where: {
      id: { in: courseIds },
      isDestroyed: false,
    },
    select: {
      id: true,
      price: true,
      categoryId: true,
    },
  });

  if (!courses.length) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "No valid courses selected.");
  }

  const items = courses.map((course) => ({
    courseId: course.id,
    price: Number(course.price || 0),
    courseCategoryId: course.categoryId,
  }));

  const originalTotal = items.reduce((sum, item) => sum + item.price, 0);

  const result = await applyCouponToOrder({
    couponCode: code,
    studentId,
    items,
    originalTotal,
  });

  return {
    couponCode: code,
    discountAmount: result.discountAmount,
    originalTotal,
    finalTotal: Number(Math.max(0, originalTotal - result.discountAmount).toFixed(2)),
    eligibleCourseIds: result.eligibleItemIds,
    coupon: {
      name: result.coupon.name,
      discountUnit: result.coupon.discountUnit,
      discount: result.coupon.discount,
    },
  };
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
  applyCouponToOrder,
  previewCoupon,
};
