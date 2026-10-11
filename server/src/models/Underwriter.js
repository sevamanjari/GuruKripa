import mongoose from "mongoose";

const underwriterSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    agencyCode: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.models.Underwriter || mongoose.model("Underwriter", underwriterSchema);
