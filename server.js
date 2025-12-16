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
 * ✅ MIDDLEWARE
 * ===============================
 */

// CORS (from env, not hardcoded)
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
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

// ❌ FAIL FAST if env missing
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is missing");
  process.exit(1);
}

if (!process.env.CLIENT_URL) {
  console.error("❌ CLIENT_URL is missing");
  process.exit(1);
}

// MongoDB connection (Atlas only, no localhost fallback)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection error:", err.message || err);
    process.exit(1);
  });
