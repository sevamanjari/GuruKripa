import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    totalAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Partial", "Pending", "No Charges"],
      default: "No Charges"
    },
    notes: { type: String, default: "", trim: true }
  },
  { timestamps: true }
);

export default mongoose.models.Customer || mongoose.model("Customer", customerSchema);
