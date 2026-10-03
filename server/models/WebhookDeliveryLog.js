import mongoose from "mongoose";

const webhookDeliveryLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    webhookEndpointId: { type: mongoose.Schema.Types.ObjectId, ref: "WebhookEndpoint", index: true },
    event: { type: String, required: true },
    url: { type: String, required: true },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    statusCode: { type: Number, default: 0 },
    responseBody: { type: String, default: "" },
    durationMs: { type: Number, default: 0 },
    status: { type: String, enum: ["success", "failed"], default: "failed" },
    error: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.models.WebhookDeliveryLog || mongoose.model("WebhookDeliveryLog", webhookDeliveryLogSchema);
