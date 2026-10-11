import mongoose from "mongoose";

const permitSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    permitNumber: { type: String, required: true, trim: true },
    vehicleId: { type: String, default: "" },
    vehicleReg: { type: String, required: true, trim: true },
    customerId: { type: String, default: "" },
    customerName: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    permitType: { type: String, default: "National Permit (Form 48 / AITP)" },
    state: { type: String, default: "All India" },
    issueDate: { type: String, default: "" },
    expiryDate: { type: String, required: true },
    issuingRto: { type: String, default: "RTO Indore (MP-09)" },
    authFeePaid: { type: Number, default: 0 },
    status: { type: String, default: "Active" },
    notes: { type: String, default: "" },
    renewalHistory: { type: Array, default: [] }
  },
  { timestamps: true }
);

export default mongoose.models.Permit || mongoose.model("Permit", permitSchema);
