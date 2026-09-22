import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    resumeUrl: { type: String, required: true },
    coverLetter: { type: String, trim: true },
    answers: [
      {
        question: String,
        answer: String,
      },
    ],
    status: {
      type: String,
      enum: ["APPLIED", "SCREENING", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED", "WITHDRAWN"],
      default: "APPLIED",
    },
    statusHistory: [
      {
        status: String,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        changedAt: { type: Date, default: Date.now },
        reason: String,
      },
    ],
    recruiterNotes: [
      {
        note: String,
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Prevent duplicate applications per candidate per job
applicationSchema.index({ candidate: 1, job: 1 }, { unique: true });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ candidate: 1, createdAt: -1 });

export default mongoose.models.Application || mongoose.model("Application", applicationSchema);
