import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    passwordHash: { type: String, required: true },
    apiKey: { type: String, sparse: true, unique: true },
    role: { type: String, default: "client" },
    useGlobalTemplateSettings: { type: Boolean, default: true },
    templateSettings: {
      brandName: { type: String, default: "My Brand" },
      colorHeaderBg: { type: String, default: "#0f766e" },
      colorHeaderText: { type: String, default: "#ffffff" },
      colorButtonBg: { type: String, default: "#0f766e" },
      colorBgLight: { type: String, default: "#f1f5f9" },
      emailFooter: { type: String, default: "© 2026 MailBridge. All rights reserved." }
    },
    senderName: { type: String, default: "" },
    senderEmail: { type: String, default: "" },
    smtpSettings: {
      enabled: { type: Boolean, default: false },
      host: { type: String, default: "" },
      port: { type: Number, default: 587 },
      secure: { type: Boolean, default: false },
      user: { type: String, default: "" },
      pass: { type: String, default: "" },
      fromEmail: { type: String, default: "" },
      fromName: { type: String, default: "" }
    }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
