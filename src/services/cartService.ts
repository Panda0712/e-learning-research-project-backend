import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const getCart = async (userId: number) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { 
      items: {
        include: {
          course: { // Lấy thêm thông tin khóa học để hiển thị tên/ảnh
            select: { name: true, thumbnail: true, price: true, lecturerName: true }
          }
        }
      } 
    },
  });

  if (!cart) {
    return { items: [] };
  }
  return cart;
};

const addToCart = async (reqBody: { userId: number; courseId: number; price: number }) => {
  const { userId, courseId, price } = reqBody;

  // 1. Tìm hoặc tạo giỏ hàng cho User
  let cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
    });
  }

  // 2. Kiểm tra xem khóa học đã có trong giỏ chưa
  const checkItem = await prisma.cartItem.findUnique({
    where: {
      cartId_courseId: { // Prisma tự tạo unique key này từ @@unique([cartId, courseId])
        cartId: cart.id,
        courseId: courseId
      }
    }
  });

  if (checkItem) {
    throw new ApiError(StatusCodes.CONFLICT, "Course already in cart!");
  }

  // 3. Thêm item mới
  const newItem = await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      courseId,
      price,
    },
  });

  return newItem;
};

const removeItem = async (itemId: number) => {
  const checkItem = await prisma.cartItem.findUnique({
    where: { id: itemId },
  });

  if (!checkItem) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Item not found in cart!");
  }

  await prisma.cartItem.delete({
    where: { id: itemId },
  });

  return { message: "Item removed from cart!" };
};

export const cartService = {
  getCart,
  addToCart,
  removeItem,
};