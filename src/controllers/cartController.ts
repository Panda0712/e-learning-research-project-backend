import { cartService } from "@/services/cartService.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const getCartByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.body;
    const result = await cartService.getCartByUserId(Number(userId));
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.body.userId);
    const courseId = Number(req.body.courseId);
    const price = Number(req.body.price);

    const result = await cartService.addToCart({ userId, courseId, price });
    res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

const removeItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await cartService.removeItem(Number(id));
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const cartController = { getCartByUserId, addToCart, removeItem };
