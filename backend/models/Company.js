import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, trim: true },
    website: { type: String, trim: true },
    logo: { type: String, trim: true },
    location: { type: String, trim: true },
    industry: { type: String, trim: true },
    size: { type: String, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recruiterIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    verificationStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
    },
    verificationDocuments: [String],
    verificationNotes: String,
  },
  { timestamps: true }
);

export default mongoose.models.Company || mongoose.model("Company", companySchema);
