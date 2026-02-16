import { orderService } from "@/services/orderService.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newOrder = await orderService.createOrder(req.body);
    res.status(StatusCodes.CREATED).json(newOrder);
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(Number(id));
    res.status(StatusCodes.OK).json(order);
  } catch (error) {
    next(error);
  }
};

const getOrdersByStudentId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { studentId } = req.body;
    const { page, limit } = req.query;
    const filterParams: any = { studentId: Number(studentId) };

    if (page) filterParams.page = Number(page);
    if (limit) filterParams.limit = Number(limit);

    const orders = await orderService.getOrdersByStudentId(filterParams);
    res.status(StatusCodes.OK).json(orders);
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, status } = req.query;
    const filterParams: any = {};

    if (page) filterParams.page = Number(page);
    if (limit) filterParams.limit = Number(limit);
    if (status) filterParams.status = String(status);

    const orders = await orderService.getAllOrders(filterParams);
    res.status(StatusCodes.OK).json(orders);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await orderService.updateOrderStatus(Number(id), status);
    res.status(StatusCodes.OK).json(updated);
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await orderService.cancelOrder(Number(id));
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await orderService.deleteOrder(Number(id));
    res.status(StatusCodes.OK).json({ message: "Order deleted successfully!" });
  } catch (error) {
    next(error);
  }
};

export const orderController = {
  createOrder,
  getOrderById,
  getOrdersByStudentId,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
};
