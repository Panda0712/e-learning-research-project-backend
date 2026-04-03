import { cartService } from "@/services/cartService.js";
import ApiError from "@/utils/ApiError.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const getCartByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const actorId = Number(req.jwtDecoded?.id);
    const { userId } = req.params;

    if (actorId !== Number(userId)) {
      throw new ApiError(StatusCodes.FORBIDDEN, "You are not allowed.");
    }

    const result = await cartService.getCartByUserId(Number(userId));
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actorId = Number(req.jwtDecoded?.id);
    const courseId = Number(req.body.courseId);

    const result = await cartService.addToCart({
      userId: actorId,
      courseId,
    });

    res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

const removeItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actorId = Number(req.jwtDecoded?.id);
    const { id } = req.params;

    const result = await cartService.removeItem(Number(id), actorId);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const cartController = { getCartByUserId, addToCart, removeItem };
