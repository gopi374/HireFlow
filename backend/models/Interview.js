import mongoose from "mongoose";

// Interview Schema
const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    interviewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    scheduledAt: {
      type: Date,
      required: true,
    },
    durationMinutes: {
      type: Number,
      default: 45,
    },
    type: {
      type: String,
      enum: ["TECHNICAL", "HR", "BEHAVIORAL", "MANAGERIAL", "OTHER"],
      default: "TECHNICAL",
    },
    mode: {
      type: String,
      enum: ["ONLINE", "OFFLINE"],
      default: "ONLINE",
    },
    meetingUrl: {
      type: String,
    },
    location: {
      type: String,
    },
    status: {
      type: String,
      enum: ["SCHEDULED", "RESCHEDULED", "COMPLETED", "CANCELLED"],
      default: "SCHEDULED",
    },
    cancellationReason: {
      type: String,
    },
    evaluation: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      feedback: {
        type: String,
      },
      strengths: [
        {
          type: String,
        },
      ],
      weaknesses: [
        {
          type: String,
        },
      ],
      decision: {
        type: String,
        enum: ["STRONG_HIRE", "HIRE", "NO_HIRE", "STRONG_NO_HIRE", "UNDECIDED"],
      },
      shareableWithCandidate: {
        type: Boolean,
        default: false,
      },
      candidateFeedback: {
        type: String,
      },
      evaluatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      evaluatedAt: {
        type: Date,
      },
    },
  },
  { timestamps: true }
);

interviewSchema.index({ application: 1, scheduledAt: -1 });
interviewSchema.index({ candidate: 1, scheduledAt: -1 });

const Interview = mongoose.models.Interview || mongoose.model("Interview", interviewSchema);
export default Interview;
