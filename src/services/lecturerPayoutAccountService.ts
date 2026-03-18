import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from "@/utils/constants.js";
import { StatusCodes } from "http-status-codes";

const createLecturerPayoutAccount = async (data: {
  lecturerId: number;
  cardType?: string;
  cardNumber?: string;
  cardExpireDate?: Date;
  cardCVV?: number;
  cardHolderName?: string;
  isDefault?: boolean;
}) => {
  try {
    // Check if lecturer exists
    const lecturer = await prisma.user.findUnique({
      where: { id: data.lecturerId, isDestroyed: false },
    });

    if (!lecturer) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Lecturer not found!");
    }

    // If this is set as default, unset all other default accounts for this lecturer
    if (data.isDefault) {
      await prisma.lecturerPayoutAccount.updateMany({
        where: {
          lecturerId: data.lecturerId,
          isDestroyed: false,
        },
        data: { isDefault: false },
      });
    }

    const newPayoutAccount = await prisma.lecturerPayoutAccount.create({
      data: {
        lecturerId: data.lecturerId,
        cardType: data.cardType,
        cardNumber: data.cardNumber,
        cardExpireDate: data.cardExpireDate,
        cardCVV: data.cardCVV,
        cardHolderName: data.cardHolderName,
        isDefault: data.isDefault || false,
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

    return newPayoutAccount;
  } catch (error) {
    throw error;
  }
};

const getLecturerPayoutAccountById = async (id: number) => {
  try {
    const payoutAccount = await prisma.lecturerPayoutAccount.findUnique({
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

    if (!payoutAccount) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Payout account not found!");
    }

    return payoutAccount;
  } catch (error) {
    throw error;
  }
};

const getAllLecturerPayoutAccounts = async (params: {
  page?: number;
  limit?: number;
  lecturerId?: number;
}) => {
  try {
    const page = params.page || DEFAULT_PAGE;
    const limit = params.limit || DEFAULT_ITEMS_PER_PAGE;
    const skip = (page - 1) * limit;

    const where: any = { isDestroyed: false };

    if (params.lecturerId) {
      where.lecturerId = params.lecturerId;
    }

    const [payoutAccounts, total] = await Promise.all([
      prisma.lecturerPayoutAccount.findMany({
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
      prisma.lecturerPayoutAccount.count({ where }),
    ]);

    return {
      data: payoutAccounts,
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

const getPayoutAccountsByLecturerId = async (params: {
  lecturerId: number;
  page?: number;
  limit?: number;
}) => {
  try {
    const page = params.page || DEFAULT_PAGE;
    const limit = params.limit || DEFAULT_ITEMS_PER_PAGE;
    const skip = (page - 1) * limit;

    const where = {
      lecturerId: params.lecturerId,
      isDestroyed: false,
    };

    const [payoutAccounts, total] = await Promise.all([
      prisma.lecturerPayoutAccount.findMany({
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
      prisma.lecturerPayoutAccount.count({ where }),
    ]);

    return {
      data: payoutAccounts,
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

const getDefaultPayoutAccount = async (lecturerId: number) => {
  try {
    const payoutAccount = await prisma.lecturerPayoutAccount.findFirst({
      where: {
        lecturerId,
        isDefault: true,
        isDestroyed: false,
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

    if (!payoutAccount) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "No default payout account found!",
      );
    }

    return payoutAccount;
  } catch (error) {
    throw error;
  }
};

const updateLecturerPayoutAccount = async (
  id: number,
  data: {
    cardType?: string;
    cardNumber?: string;
    cardExpireDate?: Date;
    cardCVV?: number;
    cardHolderName?: string;
    isDefault?: boolean;
  },
) => {
  try {
    const payoutAccount = await prisma.lecturerPayoutAccount.findUnique({
      where: { id, isDestroyed: false },
    });

    if (!payoutAccount) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Payout account not found!");
    }

    // If this is set as default, unset all other default accounts for this lecturer
    if (data.isDefault) {
      await prisma.lecturerPayoutAccount.updateMany({
        where: {
          lecturerId: payoutAccount.lecturerId,
          isDestroyed: false,
          id: { not: id },
        },
        data: { isDefault: false },
      });
    }

    const updatedPayoutAccount = await prisma.lecturerPayoutAccount.update({
      where: { id },
      data: {
        cardType: data.cardType,
        cardNumber: data.cardNumber,
        cardExpireDate: data.cardExpireDate,
        cardCVV: data.cardCVV,
        cardHolderName: data.cardHolderName,
        isDefault: data.isDefault,
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

    return updatedPayoutAccount;
  } catch (error) {
    throw error;
  }
};

const setDefaultPayoutAccount = async (id: number, lecturerId: number) => {
  try {
    const payoutAccount = await prisma.lecturerPayoutAccount.findUnique({
      where: { id, isDestroyed: false },
    });

    if (!payoutAccount) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Payout account not found!");
    }

    // Verify payout account belongs to lecturer
    if (payoutAccount.lecturerId !== lecturerId) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Payout account does not belong to this lecturer!",
      );
    }

    // Unset all other default accounts for this lecturer
    await prisma.lecturerPayoutAccount.updateMany({
      where: {
        lecturerId,
        isDestroyed: false,
        id: { not: id },
      },
      data: { isDefault: false },
    });

    // Set this account as default
    const updatedPayoutAccount = await prisma.lecturerPayoutAccount.update({
      where: { id },
      data: { isDefault: true },
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

    return updatedPayoutAccount;
  } catch (error) {
    throw error;
  }
};

const deleteLecturerPayoutAccount = async (id: number) => {
  try {
    const payoutAccount = await prisma.lecturerPayoutAccount.findUnique({
      where: { id, isDestroyed: false },
    });

    if (!payoutAccount) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Payout account not found!");
    }

    await prisma.lecturerPayoutAccount.update({
      where: { id },
      data: { isDestroyed: true },
    });

    return { message: "Payout account deleted successfully!" };
  } catch (error) {
    throw error;
  }
};

export const lecturerPayoutAccountService = {
  createLecturerPayoutAccount,
  getLecturerPayoutAccountById,
  getAllLecturerPayoutAccounts,
  getPayoutAccountsByLecturerId,
  getDefaultPayoutAccount,
  updateLecturerPayoutAccount,
  setDefaultPayoutAccount,
  deleteLecturerPayoutAccount,
};
