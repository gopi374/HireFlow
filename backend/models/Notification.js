import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["APPLICATION_STATUS", "NEW_APPLICATION", "INTERVIEW_SCHEDULED", "INTERVIEW_CANCELLED", "COMPANY_VERIFIED", "SYSTEM"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    entityType: {
      type: String,
      enum: ["Job", "Application", "Interview", "Company", "User"],
    },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
