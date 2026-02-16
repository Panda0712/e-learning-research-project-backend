import { orderItemController } from "@/controllers/orderItemController.js";
import { orderItemValidation } from "@/validations/orderItemValidation.js";
import express from "express";

const Router = express.Router();

// Add item to order
Router.route("/").post(
  orderItemValidation.addItemToOrder,
  orderItemController.addItemToOrder,
);

// Get items by order ID
Router.route("/order/:orderId").get(
  orderItemValidation.getOrderItemsByOrderId,
  orderItemController.getOrderItemsByOrderId,
);

// Get item by ID
Router.route("/:id").get(
  orderItemValidation.getOrderItemById,
  orderItemController.getOrderItemById,
);

// Update order item
Router.route("/:id").put(
  orderItemValidation.updateOrderItem,
  orderItemController.updateOrderItem,
);

// Remove item (soft delete)
Router.route("/:id/remove").delete(
  orderItemValidation.removeItemFromOrder,
  orderItemController.removeItemFromOrder,
);

// Delete item (hard delete)
Router.route("/:id").delete(
  orderItemValidation.deleteOrderItem,
  orderItemController.deleteOrderItem,
);

export const orderItemRoute = Router;
