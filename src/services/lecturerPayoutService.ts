import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from "@/utils/constants.js";
import { StatusCodes } from "http-status-codes";

const createLecturerPayout = async (data: {
  transactionId?: number;
  lecturerId: number;
  payoutAccountId?: number;
  currency?: string;
  amount?: number;
  payoutMethod?: string;
  status?: string;
}) => {
  try {
    // Check if lecturer exists
    const lecturer = await prisma.user.findUnique({
      where: { id: data.lecturerId, isDestroyed: false },
    });

    if (!lecturer) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Lecturer not found!");
    }

    // Check if payout account exists (if provided)
    if (data.payoutAccountId) {
      const payoutAccount = await prisma.lecturerPayoutAccount.findUnique({
        where: { id: data.payoutAccountId, isDestroyed: false },
      });

      if (!payoutAccount) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Payout account not found!");
      }

      // Verify payout account belongs to lecturer
      if (payoutAccount.lecturerId !== data.lecturerId) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          "Payout account does not belong to this lecturer!",
        );
      }
    }

    const newPayout = await prisma.lecturerPayout.create({
      data: {
        transactionId: data.transactionId,
        lecturerId: data.lecturerId,
        payoutAccountId: data.payoutAccountId,
        currency: data.currency,
        amount: data.amount,
        payoutMethod: data.payoutMethod,
        status: data.status || "success",
      },
      include: {
        lecturer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return newPayout;
  } catch (error) {
    throw error;
  }
};

const getLecturerPayoutById = async (id: number) => {
  try {
    const payout = await prisma.lecturerPayout.findUnique({
      where: { id, isDestroyed: false },
      include: {
        lecturer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!payout) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Payout not found!");
    }

    return payout;
  } catch (error) {
    throw error;
  }
};

const getAllLecturerPayouts = async (params: {
  page?: number;
  limit?: number;
  lecturerId?: number;
  status?: string;
}) => {
  try {
    const page = params.page || DEFAULT_PAGE;
    const limit = params.limit || DEFAULT_ITEMS_PER_PAGE;
    const skip = (page - 1) * limit;

    const where: any = { isDestroyed: false };

    if (params.lecturerId) {
      where.lecturerId = params.lecturerId;
    }

    if (params.status) {
      where.status = params.status;
    }

    const [payouts, total] = await Promise.all([
      prisma.lecturerPayout.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          lecturer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.lecturerPayout.count({ where }),
    ]);

    return {
      data: payouts,
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

const getPayoutsByLecturerId = async (params: {
  lecturerId: number;
  page?: number;
  limit?: number;
  status?: string;
}) => {
  try {
    const page = params.page || DEFAULT_PAGE;
    const limit = params.limit || DEFAULT_ITEMS_PER_PAGE;
    const skip = (page - 1) * limit;

    const where: any = {
      lecturerId: params.lecturerId,
      isDestroyed: false,
    };

    if (params.status) {
      where.status = params.status;
    }

    const [payouts, total] = await Promise.all([
      prisma.lecturerPayout.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          lecturer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.lecturerPayout.count({ where }),
    ]);

    return {
      data: payouts,
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

const updateLecturerPayout = async (
  id: number,
  data: {
    transactionId?: number;
    payoutAccountId?: number;
    currency?: string;
    amount?: number;
    payoutMethod?: string;
    status?: string;
  },
) => {
  try {
    const payout = await prisma.lecturerPayout.findUnique({
      where: { id, isDestroyed: false },
    });

    if (!payout) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Payout not found!");
    }

    // Check if payout account exists (if provided)
    if (data.payoutAccountId) {
      const payoutAccount = await prisma.lecturerPayoutAccount.findUnique({
        where: { id: data.payoutAccountId, isDestroyed: false },
      });

      if (!payoutAccount) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Payout account not found!");
      }

      // Verify payout account belongs to lecturer
      if (payoutAccount.lecturerId !== payout.lecturerId) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          "Payout account does not belong to this lecturer!",
        );
      }
    }

    const updatedPayout = await prisma.lecturerPayout.update({
      where: { id },
      data: {
        transactionId: data.transactionId,
        payoutAccountId: data.payoutAccountId,
        currency: data.currency,
        amount: data.amount,
        payoutMethod: data.payoutMethod,
        status: data.status,
      },
      include: {
        lecturer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return updatedPayout;
  } catch (error) {
    throw error;
  }
};

const updatePayoutStatus = async (id: number, status: string) => {
  try {
    const payout = await prisma.lecturerPayout.findUnique({
      where: { id, isDestroyed: false },
    });

    if (!payout) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Payout not found!");
    }

    const updatedPayout = await prisma.lecturerPayout.update({
      where: { id },
      data: { status },
      include: {
        lecturer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return updatedPayout;
  } catch (error) {
    throw error;
  }
};

const deleteLecturerPayout = async (id: number) => {
  try {
    const payout = await prisma.lecturerPayout.findUnique({
      where: { id, isDestroyed: false },
    });

    if (!payout) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Payout not found!");
    }

    await prisma.lecturerPayout.update({
      where: { id },
      data: { isDestroyed: true },
    });

    return { message: "Payout deleted successfully!" };
  } catch (error) {
    throw error;
  }
};

export const lecturerPayoutService = {
  createLecturerPayout,
  getLecturerPayoutById,
  getAllLecturerPayouts,
  getPayoutsByLecturerId,
  updateLecturerPayout,
  updatePayoutStatus,
  deleteLecturerPayout,
};
