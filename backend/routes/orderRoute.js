import express from "express";

// import controllers
import { getOrderStats, getUserOrderStats, getOrderByUser, addOrder, removeOrder, getAllOrders, updateOrder, getPaginatedOrders } from "../controllers/orderController.js";

const router = express.Router();

// route to get all orders
export const orderRoute = router.get("/", getAllOrders);
export const paginatedOrdersRoute = router.get("/paginated", getPaginatedOrders);
export const orderStatsRoute = router.get("/orderStats", getOrderStats);
export const userOrderStatsRoute = router.get("/userOrderStats/:userId", getUserOrderStats);
export const orderRouteByUser = router.get("/:userId", getOrderByUser);
export const addOrderRoute = router.post("/", addOrder);
export const updateOrderRoute = router.put("/:orderId", updateOrder);
export const removeOrderRoute = router.delete("/:orderId", removeOrder);
