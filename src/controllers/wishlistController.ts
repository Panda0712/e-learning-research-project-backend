import { wishlistService } from "@/services/wishlistService.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const createWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = Number(req.jwtDecoded?.id);
    const { courseId } = req.body;

    const data = await wishlistService.createWishlist({
      userId,
      courseId: Number(courseId),
    });
    res.status(StatusCodes.CREATED).json(data);
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

    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;

    const wishlists = await wishlistService.getWishlistsByUserId({
      userId: Number(userId),
      page: pageNumber,
      limit: limitNumber,
    });
    res.status(StatusCodes.OK).json(wishlists);
  } catch (error) {
    next(error);
  }
};

const getMyWishlists = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = Number(req.jwtDecoded?.id);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const data = await wishlistService.getWishlistsByUserId({
      userId,
      page,
      limit,
    });
    res.status(StatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
};

const checkMyCourseInWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = Number(req.jwtDecoded?.id);
    const courseId = Number(req.params.courseId);
    const data = await wishlistService.checkCourseInWishlist(userId, courseId);
    res.status(StatusCodes.OK).json(data);
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
    const userId = Number(req.jwtDecoded?.id);
    const id = Number(req.params.id);
    const data = await wishlistService.deleteWishlist(id, userId);
    res.status(StatusCodes.OK).json(data);
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
    const userId = Number(req.jwtDecoded?.id);
    const courseId = Number(req.params.courseId);

    const result = await wishlistService.deleteWishlistByCourse(
      userId,
      courseId,
    );
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const wishlistController = {
  createWishlist,
  getWishlistById,
  getMyWishlists,
  checkMyCourseInWishlist,
  getAllWishlists,
  getWishlistsByUserId,
  checkCourseInWishlist,
  updateWishlist,
  deleteWishlist,
  deleteWishlistByCourse,
};
