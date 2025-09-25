import express from "express";

// import controllers
import {addPizza, getAllPizzas, getPizzaByID, getFilterPizzas, updatePizza, deletePizza} from "../controllers/pizzaController.js";

const router = express.Router();

// route to get pizzas
export const pizzaRoute = router.get("/", getAllPizzas);
export const filterPizzasRoute = router.get("/filter", getFilterPizzas);
export const pizzaRouteByID = router.get("/:id", getPizzaByID);
export const addPizzaRoute = router.post("/", addPizza);
export const updatePizzaRoute = router.put("/:id", updatePizza);
export const removePizzaRoute = router.delete("/:id", deletePizza);