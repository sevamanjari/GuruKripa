import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    regNumber: { type: String, required: true, uppercase: true, trim: true },
    customerId: { type: String, default: "" },
    customerName: { type: String, default: "" },
    vehicleClass: { type: String, default: "" },
    makeModel: { type: String, default: "" },
    status: { type: String, default: "Active" }
  },
  { timestamps: true }
);

export default mongoose.models.Vehicle || mongoose.model("Vehicle", vehicleSchema);
