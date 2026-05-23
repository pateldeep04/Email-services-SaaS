import mongoose from "mongoose";

const otpTokenSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    purpose: { type: String, default: "login" },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    apiKey: { type: String, index: true }
  },
  { timestamps: true }
);

export default mongoose.models.OtpToken || mongoose.model("OtpToken", otpTokenSchema);
