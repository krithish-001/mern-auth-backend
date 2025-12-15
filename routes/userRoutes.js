// routes/userRoutes.js
import express from "express";
import { getProfile, deleteAccount } from "../controllers/userController.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", auth, getProfile);
router.delete("/profile", auth, deleteAccount);

export default router;
