import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["welcome", "otp", "forgot-password", "notification", "custom"],
      required: true
    },
    to: { type: String, required: true },
    subject: { type: String, required: true },
    status: {
      type: String,
      enum: ["sent", "simulated", "failed"],
      required: true
    },
    providerMessageId: String,
    error: String,
    metadata: mongoose.Schema.Types.Mixed,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    apiKey: { type: String, index: true },
    keyStyle: { type: String, default: "Global Style" }
  },
  { timestamps: true }
);

export default mongoose.models.EmailLog || mongoose.model("EmailLog", emailLogSchema);
