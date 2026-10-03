import mongoose from "mongoose";

const webhookEndpointSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    url: { type: String, required: true, trim: true },
    description: { type: String, default: "Production Webhook", trim: true },
    secret: { type: String, required: true },
    events: {
      type: [String],
      default: ["email.sent", "email.opened", "email.clicked", "email.failed", "sms.sent"]
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.models.WebhookEndpoint || mongoose.model("WebhookEndpoint", webhookEndpointSchema);
