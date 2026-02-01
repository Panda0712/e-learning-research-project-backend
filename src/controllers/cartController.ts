import { cartService } from "@/services/cartService.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Giả sử userId lấy từ body (nếu chưa có middleware auth)
    // Nếu có auth middleware rồi thì dùng: Number(req.user.id)
    const { userId } = req.body; 
    const result = await cartService.getCart(Number(userId));
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Ép kiểu tất cả dữ liệu số
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
    const result = await cartService.removeItem(Number(id)); // Ép kiểu params ID
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const cartController = { getCart, addToCart, removeItem };