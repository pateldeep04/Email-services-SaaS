import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    lastUsedAt: { type: Date },
    styleType: { type: String, enum: ["global", "custom"], default: "global" },
    templateSettings: {
      brandName: { type: String, default: "My Brand" },
      logoUrl: { type: String, default: "" },
      colorHeaderBg: { type: String, default: "#0f766e" },
      colorHeaderText: { type: String, default: "#ffffff" },
      colorButtonBg: { type: String, default: "#0f766e" },
      colorBgLight: { type: String, default: "#f1f5f9" },
      emailFooter: { type: String, default: "© 2026 MailBridge. All rights reserved." },
      emailActionText: { type: String, default: "Get Started" },
      emailActionUrl: { type: String, default: "https://mail-bridge.email" },
      showButton: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

export default mongoose.models.ApiKey || mongoose.model("ApiKey", apiKeySchema);
