import { prisma } from "@/lib/prisma.js";
import ApiError from "@/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const getCartByUserId = async (userId: number) => {
  try {
    // check cart existence
    const cart = await prisma.cart.findUnique({
      where: { userId },
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
    throw new Error(error);
  }
};

const addToCart = async (reqBody: {
  userId: number;
  courseId: number;
  price: number;
}) => {
  try {
    const { userId, courseId, price } = reqBody;

    // check cart existence by user id
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    // check course in cart
    const checkItem = await prisma.cartItem.findUnique({
      where: {
        cartId_courseId: {
          cartId: cart.id,
          courseId: courseId,
        },
      },
    });

    if (checkItem) {
      throw new ApiError(StatusCodes.CONFLICT, "Course already in cart!");
    }

    // create new cart
    const newItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        courseId,
        price,
      },
    });

    return newItem;
  } catch (error: any) {
    throw new Error(error);
  }
};

const removeItem = async (itemId: number) => {
  try {
    // check cart existence by id
    const checkItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!checkItem) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Item not found in cart!");
    }

    // delete cart by id
    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return { message: "Item removed from cart!" };
  } catch (error: any) {
    throw new Error(error);
  }
};

export const cartService = {
  getCartByUserId,
  addToCart,
  removeItem,
};
