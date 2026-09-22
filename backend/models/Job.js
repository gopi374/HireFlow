import mongoose from "mongoose";

// Job Schema
const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    responsibilities: [
      {
        type: String,
      },
    ],
    requirements: [
      {
        type: String,
      },
    ],
    skills: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    location: {
      type: String,
      required: true,
      trim: true,
    },
    workMode: {
      type: String,
      enum: ["REMOTE", "ON_SITE", "HYBRID"],
      default: "HYBRID",
    },
    employmentType: {
      type: String,
      enum: ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"],
      default: "FULL_TIME",
    },
    experience: {
      min: {
        type: Number,
        default: 0,
      },
      max: {
        type: Number,
        default: 0,
      },
    },
    salary: {
      min: {
        type: Number,
        default: 0,
      },
      max: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: "USD",
      },
      isNegotiable: {
        type: Boolean,
        default: false,
      },
    },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "CLOSED", "ARCHIVED"],
      default: "DRAFT",
    },
    deadline: {
      type: Date,
    },
    applicationsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Search indexes for job filtering & keyword search
jobSchema.index({ title: "text", description: "text", skills: "text" });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ company: 1, status: 1 });
jobSchema.index({ location: 1, workMode: 1, employmentType: 1 });

const Job = mongoose.models.Job || mongoose.model("Job", jobSchema);
export default Job;
