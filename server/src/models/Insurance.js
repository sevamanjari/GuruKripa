import mongoose from "mongoose";

const insuranceSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    policyNumber: { type: String, required: true, trim: true },
    vehicleId: { type: String, default: "" },
    vehicleReg: { type: String, required: true, trim: true },
    customerId: { type: String, default: "" },
    customerName: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    insuranceCompany: { type: String, required: true, trim: true },
    coverageType: { type: String, default: "Comprehensive Package" },
    issueDate: { type: String, default: "" },
    expiryDate: { type: String, required: true },
    idvAmount: { type: Number, default: 0 },
    premiumAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Partial", "Due", "No Charges"],
      default: "Due"
    },
    ncbPercentage: { type: Number, default: 0 },
    status: { type: String, default: "Active" },
    notes: { type: String, default: "" },
    renewalHistory: { type: Array, default: [] }
  },
  { timestamps: true }
);

export default mongoose.models.Insurance || mongoose.model("Insurance", insuranceSchema);
