import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  token: String,
  createdAt: Date,
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String, required: true },

    role: { type: String, default: "user" },

    refreshTokens: [refreshTokenSchema],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
