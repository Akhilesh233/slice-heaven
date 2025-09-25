import mongoose from "mongoose";
import Pizza from "../models/pizzamodel.js";
import connectDB from "../config/db.js";
import dotenv from 'dotenv';
import fs from "fs";

dotenv.config();

async function seed() {
  await connectDB();
  const pizzas = JSON.parse(fs.readFileSync("../backend/config/pizzadb.json", "utf-8"));
  await Pizza.insertMany(pizzas);
  console.log("Pizzas seeded!");
  mongoose.disconnect();
}

seed();