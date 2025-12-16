import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";
const ACCESS_EXPIRES = "15m";
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || "dev_refresh_secret";
const REFRESH_EXPIRES = "7d";

const cookieOptions = {
  httpOnly: true,
  secure: false, // true only in production + https
  sameSite: "Lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const signAccessToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: ACCESS_EXPIRES,
  });

const signRefreshToken = (user) =>
  jwt.sign({ id: user._id }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES,
  });

// ✅ REGISTER
export const register = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { name, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
    await user.save();

    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
      accessToken,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ LOGIN
export const login = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    console.log("👉 LOGIN BODY:", req.body);
    console.log("👉 LOGIN EMAIL:", email);
    console.log("👉 DB NAME:", User.db.name);

    if (!email || !password) {
      console.log("❌ Missing email or password");
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    console.log("👉 USER FOUND:", !!user);

    if (!user) {
      console.log("❌ No user with this email");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    console.log("👉 PASSWORD MATCH:", valid);

    if (!valid) {
      console.log("❌ Password mismatch");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
    await user.save();

    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email },
      accessToken,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ REFRESH
export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token" });

  try {
    const payload = jwt.verify(token, REFRESH_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.sendStatus(403);

    const found = user.refreshTokens.find((t) => t.token === token);
    if (!found) return res.sendStatus(403);

    const newRefresh = signRefreshToken(user);
    user.refreshTokens = user.refreshTokens.filter((t) => t.token !== token);
    user.refreshTokens.push({ token: newRefresh, createdAt: new Date() });
    await user.save();

    res.cookie("refreshToken", newRefresh, cookieOptions);

    const accessToken = signAccessToken(user);
    res.json({
      user: { id: user._id, name: user.name, email: user.email },
      accessToken,
    });
  } catch {
    res.sendStatus(403);
  }
};

// ✅ LOGOUT
export const logout = async (req, res) => {
  res.clearCookie("refreshToken", cookieOptions);
  res.json({ message: "Logged out" });
};

// DELETE USER ACCOUNT
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    await User.findByIdAndDelete(userId);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    });

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("deleteAccount error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
