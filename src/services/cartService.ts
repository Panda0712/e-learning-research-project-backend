import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const getCartByUserId = async (userId: number) => {
  try {
    // check cart existence
    const cart = await prisma.cart.findUnique({
      where: { userId, isDestroyed: false },
      include: {
        items: {
          include: {
            course: {
              select: {
                name: true,
                thumbnail: true,
                price: true,
                lecturerName: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return { items: [] };
    }
    return cart;
  } catch (error: any) {
    throw error;
  }
};

const addToCart = async (reqBody: { userId: number; courseId: number }) => {
  const { userId, courseId } = reqBody;

  const user = await prisma.user.findUnique({
    where: { id: userId, isDestroyed: false },
    select: { id: true, role: true },
  });
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");

  const course = await prisma.course.findUnique({
    where: { id: courseId, isDestroyed: false, status: "published" },
    select: { id: true, price: true, lecturerId: true },
  });
  if (!course) throw new ApiError(StatusCodes.NOT_FOUND, "Course not found!");

  const purchased = await prisma.orderItem.findFirst({
    where: {
      courseId,
      order: { studentId: userId, isSuccess: true, isDestroyed: false },
      isDestroyed: false,
    },
    select: { id: true },
  });
  if (purchased) {
    throw new ApiError(StatusCodes.CONFLICT, "Course already purchased!");
  }

  let cart = await prisma.cart.findUnique({
    where: { userId, isDestroyed: false },
  });

  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }

  const existed = await prisma.cartItem.findUnique({
    where: {
      cartId_courseId: {
        cartId: cart.id,
        courseId,
      },
    },
  });

  if (existed) {
    throw new ApiError(StatusCodes.CONFLICT, "Course already in cart!");
  }

  return prisma.cartItem.create({
    data: {
      cartId: cart.id,
      courseId,
      price: Number(course.price || 0),
    },
  });
};

const removeItem = async (itemId: number, userId: number) => {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: { select: { userId: true } } },
  });

  if (!item)
    throw new ApiError(StatusCodes.NOT_FOUND, "Item not found in cart!");
  if (item.cart.userId !== userId) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You are not allowed.");
  }

  await prisma.cartItem.delete({ where: { id: itemId } });
  return { message: "Item removed from cart!" };
};

export const cartService = {
  getCartByUserId,
  addToCart,
  removeItem,
};
