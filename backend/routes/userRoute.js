import express from "express";

// import controllers
import { getUsers, addUser, getUserByID, getUserByName, updateUser, deleteUser } from "../controllers/userController.js";

const router = express.Router();

// route to get all orders
export const userRoute = router.get("/", getUsers);
export const addUserRoute = router.post("/", addUser);
export const userRouteByName = router.get("/:name", getUserByName);
export const userRouteByID = router.get("/:id", getUserByID);
export const updateUserRoute = router.put("/:id", updateUser);
export const removeUserRoute = router.delete("/:id", deleteUser);
