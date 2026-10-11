import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: "" },
    serviceType: { type: String, default: "General" },
    vehicleNumber: { type: String, default: "" },
    docNumber: { type: String, default: "" },
    dueDate: { type: String, default: "" },
    amount: { type: mongoose.Schema.Types.Mixed, default: 0 },
    status: { type: String, default: "Pending" },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.models.Customer || mongoose.model("Customer", customerSchema);
