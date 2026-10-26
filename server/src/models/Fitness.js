import mongoose from "mongoose";

const fitnessSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    fitnessNumber: { type: String, default: "", trim: true },
    vehicleReg: { type: String, required: true, trim: true },
    customerId: { type: String, default: "" },
    customerName: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    rtoAffiliated: { type: String, default: "RTO Indore (MP-09)" },
    issueDate: { type: String, default: "" },
    expiryDate: { type: String, required: true },
    documentUrl: { type: String, default: "" },
    documentName: { type: String, default: "" },
    documentSize: { type: Number, default: 0 },
    uploadedAt: { type: String, default: "" },
    totalAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Partial", "Due", "No Charges"],
      default: "Due"
    },
    status: { type: String, default: "Active" },
    notes: { type: String, default: "" },
    renewalHistory: { type: Array, default: [] }
  },
  { timestamps: true }
);

export default mongoose.models.Fitness || mongoose.model("Fitness", fitnessSchema);
