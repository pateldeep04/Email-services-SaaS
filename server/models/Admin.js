import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: "System Administrator"
    },
    role: {
      type: String,
      default: "superadmin"
    },
    apiKey: {
      type: String,
      sparse: true,
      unique: true
    },
    isMaster: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date,
      default: null
    }
  },
  {
    collection: "admins",
    timestamps: true
  }
);

export default mongoose.models.Admin || mongoose.model("Admin", adminSchema);
