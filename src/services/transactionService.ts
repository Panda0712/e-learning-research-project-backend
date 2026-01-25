import { prisma } from '../lib/prisma.js';
import { enrollmentService } from './enrollmentService.js'; 

const createTransaction = async (data: any) => {
  const { userId, items, paymentMethod, totalAmount } = data;

  for (const item of items) {
    if (item.discountCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: item.discountCode }
      });

      if (!coupon) {
        throw new Error(`Mã giảm giá '${item.discountCode}' không tồn tại!`);
      }

      if (coupon.quantity !== null && coupon.quantity <= 0) {
        throw new Error(`Mã '${item.discountCode}' đã hết lượt sử dụng!`);
      }

      const now = new Date();
      if (coupon.endingDate && new Date(coupon.endingDate) < now) {
        throw new Error(`Mã '${item.discountCode}' đã hết hạn!`);
      }
      
      if (coupon.startingDate && new Date(coupon.startingDate) > now) {
         throw new Error(`Mã '${item.discountCode}' chưa đến thời gian áp dụng!`);
      }
    }
  }

  const newTransaction = await prisma.transaction.create({
    data: {
      userId: Number(userId),
      amount: parseFloat(totalAmount),
      paymentMethod: paymentMethod,
      status: 'success', 
      gatewayReference: `TRANS_${Date.now()}`,
      
      studentTransactions: {
        create: items.map((item: any) => ({
          courseId: Number(item.courseId),
          discountCode: item.discountCode || null,
          discountAmount: item.discountAmount || 0,
          isDiscount: item.discountAmount > 0 ? true : false
        }))
      }
    },
    include: {
      studentTransactions: true 
    }
  });

  if (newTransaction.status === 'success') {
    for (const item of items) {
      try {
        await enrollmentService.createEnrollment({
          studentId: Number(userId),
          courseId: Number(item.courseId)
        });
      } catch (error) {
        console.warn(`>> User ${userId} đã học khóa ${item.courseId} rồi.`);
      }

      if (item.discountCode) {
        await prisma.coupon.update({
          where: { code: item.discountCode },
          data: {
            quantity: { decrement: 1 } 
          }
        });
        console.log(`>> Đã trừ 1 lượt dùng của mã ${item.discountCode}`);
      }
    }
  }
  return newTransaction;
};

const getHistoryByUserId = async (userId: number) => {
  return await prisma.transaction.findMany({
    where: {
      userId: Number(userId)
    },
    include: {
      studentTransactions: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

export const transactionService = {
  createTransaction,
  getHistoryByUserId
};