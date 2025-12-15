// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

/**
 * ===============================
 * ✅ MIDDLEWARE (ORDER MATTERS)
 * ===============================
 */

// ✅ CORS — ONLY ONCE (VERY IMPORTANT)
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true,               // allow cookies
  })
);

// body parser
app.use(express.json());

// cookie parser
app.use(cookieParser());

/**
 * ===============================
 * ✅ ROUTES
 * ===============================
 */

// health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Auth backend running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

/**
 * ===============================
 * ✅ DATABASE + SERVER START
 * ===============================
 */

const PORT = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/authdb";

console.log("DEBUG: Using mongoUri =", mongoUri);
console.log("DEBUG: CORS origin = http://localhost:5173");

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection error:", err.message || err);
    process.exit(1);
  });
