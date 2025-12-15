// controllers/userController.js
import User from "../models/user.js";

/**
 * GET PROFILE
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(userId).select(
      "-password -refreshTokens -resetPasswordToken -resetPasswordExpires"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    console.error("getProfile error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE ACCOUNT
 */
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    await User.findByIdAndDelete(userId);

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("deleteAccount error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
