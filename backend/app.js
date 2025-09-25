import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import mongoose from "mongoose";

// routes
import {addPizzaRoute, pizzaRoute, pizzaRouteByID, filterPizzasRoute, updatePizzaRoute, removePizzaRoute} from "./routes/pizzaRoute.js";
import {userRoute, addUserRoute, userRouteByID, userRouteByName, updateUserRoute, removeUserRoute} from "./routes/userRoute.js";
import {orderRoute, addOrderRoute, orderRouteByUser, removeOrderRoute, orderStatsRoute, updateOrderRoute, userOrderStatsRoute} from "./routes/orderRoute.js";
import adminRoute from "./routes/adminRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // allow requests from different origins
app.use(express.json());

// connecting to mongoDB Atlas
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// API routes
app.get("/", (req, res) => {
    res.send("Welcome to the Pizza Shop API!");
});

// Pizza routes
app.use("/v1/pizzas", pizzaRoute);
app.use("/v1/pizzas/filter", filterPizzasRoute);
app.use("/v1/pizzas/:id", pizzaRouteByID);
app.use("/v1/pizzas/add", addPizzaRoute);
app.use("/v1/pizzas/:id", updatePizzaRoute);
app.use("/v1/pizzas/:id", removePizzaRoute);

// User routes
app.use("/v1/users", userRoute);
app.use("/v1/users/add", addUserRoute);
app.use("/v1/users/:name", userRouteByName);
app.use("/v1/users/:id", userRouteByID);
app.use("/v1/users/:id", updateUserRoute);
app.use("/v1/users/:id", removeUserRoute);

//Order routes
app.use("/v1/orders/", orderRoute);
app.use("/v1/orders/orderStats", orderStatsRoute);
app.use("/v1/orders/userOrderStats/:userId", userOrderStatsRoute);
app.use("/v1/orders/:userId", orderRouteByUser);
app.use("/v1/orders/add", addOrderRoute);
app.use("/v1/orders/:orderId", removeOrderRoute);
app.use("/v1/orders/:orderId", updateOrderRoute);

// Admin routes
app.use("/v1/admin", adminRoute);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});