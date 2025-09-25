import mongoose from "mongoose";
import User from "../models/usermodel.js";
import connectDB from "../config/db.js";
import dotenv from 'dotenv';
import fs from "fs";

dotenv.config();

async function seed() {
  await connectDB();
  const users = JSON.parse(fs.readFileSync("../backend/config/userdb.json", "utf-8"));
  await User.insertMany(users);
  console.log("Users seeded!");
  mongoose.disconnect();
}

seed();