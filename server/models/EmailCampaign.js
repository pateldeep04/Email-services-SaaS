import mongoose from "mongoose";

const recipientSchema = new mongoose.Schema({
  email: { type: String, required: true },
  recipientData: { type: mongoose.Schema.Types.Mixed, default: {} },
  trackingId: { type: String, required: true, index: true },
  status: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
  error: { type: String, default: "" },
  opened: { type: Boolean, default: false },
  openedAt: { type: Date, default: null },
  openCount: { type: Number, default: 0 },
  lastOpenedAt: { type: Date, default: null },
  clicked: { type: Boolean, default: false },
  clickedAt: { type: Date, default: null },
  clickCount: { type: Number, default: 0 },
  ip: { type: String, default: "" },
  userAgent: { type: String, default: "" },
  sentAt: { type: Date, default: null }
});

const emailCampaignSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    senderName: { type: String, default: "" },
    senderEmail: { type: String, default: "" },
    ctaButtonText: { type: String, default: "" },
    ctaTargetUrl: { type: String, default: "" },
    totalRecipients: { type: Number, default: 0 },
    sentCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    openedCount: { type: Number, default: 0 },
    clickedCount: { type: Number, default: 0 },
    recipients: [recipientSchema]
  },
  { timestamps: true }
);

export default mongoose.models.EmailCampaign || mongoose.model("EmailCampaign", emailCampaignSchema);
