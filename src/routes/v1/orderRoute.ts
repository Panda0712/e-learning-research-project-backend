import { orderController } from "@/controllers/orderController.js";
import { orderValidation } from "@/validations/orderValidation.js";
import express from "express";

const Router = express.Router();

// Create order
Router.route("/").post(
  orderValidation.createOrder,
  orderController.createOrder,
);

// Get all orders (admin)
Router.route("/").get(orderController.getAllOrders);

// Get order by ID
Router.route("/:id").get(
  orderValidation.getOrderById,
  orderController.getOrderById,
);

// Get orders by student ID
Router.route("/student/list").post(
  orderValidation.getOrdersByStudentId,
  orderController.getOrdersByStudentId,
);

// Update order status
Router.route("/:id/status").put(
  orderValidation.updateOrderStatus,
  orderController.updateOrderStatus,
);

// Cancel order
Router.route("/:id/cancel").put(
  orderValidation.cancelOrder,
  orderController.cancelOrder,
);

// Delete order
Router.route("/:id").delete(
  orderValidation.deleteOrder,
  orderController.deleteOrder,
);

export const orderRoute = Router;
