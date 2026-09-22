import mongoose from "mongoose";

const candidateProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    headline: { type: String, trim: true },
    summary: { type: String, trim: true },
    location: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
    experience: [
      {
        title: String,
        company: String,
        location: String,
        startDate: Date,
        endDate: Date,
        current: Boolean,
        description: String,
      },
    ],
    education: [
      {
        institution: String,
        degree: String,
        fieldOfStudy: String,
        startYear: Number,
        endYear: Number,
      },
    ],
    projects: [
      {
        title: String,
        description: String,
        url: String,
        skills: [String],
      },
    ],
    certifications: [
      {
        name: String,
        issuingOrganization: String,
        issueDate: Date,
        credentialUrl: String,
      },
    ],
    links: {
      github: String,
      linkedin: String,
      portfolio: String,
      other: String,
    },
    resumes: [
      {
        fileName: String,
        fileUrl: String,
        fileSize: Number,
        mimeType: String,
        isPrimary: { type: Boolean, default: false },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
  },
  { timestamps: true }
);

export default mongoose.models.CandidateProfile || mongoose.model("CandidateProfile", candidateProfileSchema);
