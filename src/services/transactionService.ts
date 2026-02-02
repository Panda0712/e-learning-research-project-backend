import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../lib/prisma.js";
import { enrollmentService } from "./enrollmentService.js";

const createTransaction = async (data: {
  userId: number;
  items: any[];
  paymentMethod: string;
  totalAmount: number;
}) => {
  try {
    const { userId, items, paymentMethod, totalAmount } = data;

    for (const item of items) {
      if (item.discountCode) {
        const coupon = await prisma.coupon.findUnique({
          where: { code: item.discountCode, isDestroyed: false },
        });

        if (!coupon) {
          throw new ApiError(
            StatusCodes.NOT_FOUND,
            `Discount code: '${item.discountCode}' does not exist!`,
          );
        }

        if (coupon.quantity !== null && coupon.quantity <= 0) {
          throw new ApiError(
            StatusCodes.CONFLICT,
            `Code '${item.discountCode}' has been used up!`,
          );
        }

        const now = new Date();
        if (coupon.endingDate && new Date(coupon.endingDate) < now) {
          throw new ApiError(
            StatusCodes.CONFLICT,
            `Code '${item.discountCode}' has expired!`,
          );
        }

        if (coupon.startingDate && new Date(coupon.startingDate) > now) {
          throw new ApiError(
            StatusCodes.CONFLICT,
            `Code '${item.discountCode}' is not available yet!`,
          );
        }
      }
    }

    const newTransaction = await prisma.transaction.create({
      data: {
        userId: Number(userId),
        amount: Number(totalAmount),
        paymentMethod: paymentMethod,
        status: "success",
        gatewayReference: `TRANS_${Date.now()}`,

        studentTransactions: {
          create: items.map((item: any) => ({
            courseId: Number(item.courseId),
            discountCode: item.discountCode || null,
            discountAmount: item.discountAmount || 0,
            isDiscount: item.discountAmount > 0 ? true : false,
          })),
        },
      },
      include: {
        studentTransactions: true,
      },
    });

    if (newTransaction.status === "success") {
      for (const item of items) {
        try {
          await enrollmentService.createEnrollment({
            studentId: Number(userId),
            courseId: Number(item.courseId),
          });
        } catch (error: any) {
          throw new ApiError(StatusCodes.CONFLICT, error.message);
        }

        if (item.discountCode) {
          await prisma.coupon.update({
            where: { code: item.discountCode },
            data: {
              quantity: { decrement: 1 },
            },
          });
        }
      }
    }
    return newTransaction;
  } catch (error: any) {
    throw new Error(error);
  }
};

const getHistoryByUserId = async (userId: number) => {
  try {
    const historyList = await prisma.transaction.findMany({
      where: {
        userId: Number(userId),
        isDestroyed: false,
      },
      include: {
        studentTransactions: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return historyList;
  } catch (error: any) {
    throw new Error(error);
  }
};

const getStudentTransactionsByCourseId = async (courseId: number) => {
  try {
    const studentTransactions = await prisma.transactionStudent.findMany({
      where: {
        courseId: Number(courseId),
        transaction: {
          status: "success",
        },
        isDestroyed: false,
      },
      include: {
        transaction: {
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
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return studentTransactions;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const transactionService = {
  createTransaction,
  getHistoryByUserId,
  getStudentTransactionsByCourseId,
};
