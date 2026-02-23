import { wishlistService } from "@/services/wishlistService.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const createWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const newWishlist = await wishlistService.createWishlist(req.body);
    res.status(StatusCodes.CREATED).json(newWishlist);
  } catch (error) {
    next(error);
  }
};

const getWishlistById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const wishlist = await wishlistService.getWishlistById(Number(id));
    res.status(StatusCodes.OK).json(wishlist);
  } catch (error) {
    next(error);
  }
};

const getAllWishlists = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, userId } = req.query;
    const filterParams: any = {};

    if (page) filterParams.page = Number(page);
    if (limit) filterParams.limit = Number(limit);
    if (userId) filterParams.userId = Number(userId);

    const wishlists = await wishlistService.getAllWishlists(filterParams);
    res.status(StatusCodes.OK).json(wishlists);
  } catch (error) {
    next(error);
  }
};

const getWishlistsByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;
    const { page, limit } = req.query;
    const filterParams: any = { userId: Number(userId) };

    if (page) filterParams.page = Number(page);
    if (limit) filterParams.limit = Number(limit);

    const wishlists = await wishlistService.getWishlistsByUserId(filterParams);
    res.status(StatusCodes.OK).json(wishlists);
  } catch (error) {
    next(error);
  }
};

const checkCourseInWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, courseId } = req.params;
    const result = await wishlistService.checkCourseInWishlist(
      Number(userId),
      Number(courseId),
    );
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const updateWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const updatedWishlist = await wishlistService.updateWishlist(
      Number(id),
      req.body,
    );
    res.status(StatusCodes.OK).json(updatedWishlist);
  } catch (error) {
    next(error);
  }
};

const deleteWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await wishlistService.deleteWishlist(Number(id));
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteWishlistByCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, courseId } = req.params;
    const result = await wishlistService.deleteWishlistByCourse(
      Number(userId),
      Number(courseId),
    );
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const wishlistController = {
  createWishlist,
  getWishlistById,
  getAllWishlists,
  getWishlistsByUserId,
  checkCourseInWishlist,
  updateWishlist,
  deleteWishlist,
  deleteWishlistByCourse,
};
