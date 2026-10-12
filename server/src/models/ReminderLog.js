import mongoose from "mongoose";

const reminderLogSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ["insurance_renewal", "permit_renewal", "payment_due", "custom"],
      default: "insurance_renewal"
    },
    recipientPhone: { type: String, required: true },
    recipientName: { type: String, default: "" },
    referenceId: { type: String, default: "" },
    vehicleReg: { type: String, default: "" },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["sent", "simulated", "failed"],
      default: "simulated"
    },
    channel: {
      type: String,
      default: "whatsapp_cloud_api"
    },
    error: { type: String, default: "" },
    sentAt: { type: String, default: () => new Date().toISOString() }
  },
  { timestamps: true }
);

export default mongoose.models.ReminderLog || mongoose.model("ReminderLog", reminderLogSchema);
