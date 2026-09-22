import Interview from "../models/Interview.js";
import Application from "../models/Application.js";
import { sendSuccess, sendError, getPagination } from "../utils/response.js";
import { logAudit, createNotification } from "../utils/audit.js";

export const scheduleInterview = async (req, res, next) => {
  try {
    const { applicationId, scheduledAt, durationMinutes, type, mode, meetingUrl, location, interviewers } = req.body;

    if (!applicationId || !scheduledAt) {
      return sendError(res, "Application ID and scheduled time are required.", 400, "MISSING_FIELDS");
    }

    const application = await Application.findById(applicationId).populate("job");
    if (!application) {
      return sendError(res, "Application not found", 404, "NOT_FOUND");
    }

    if (application.job.recruiter.toString() !== req.user._id.toString() && req.user.role !== "ADMIN") {
      return sendError(res, "Not authorized to schedule interviews for this application", 403, "FORBIDDEN");
    }

    const interview = await Interview.create({
      application: applicationId,
      job: application.job._id,
      candidate: application.candidate,
      interviewers: interviewers?.length ? interviewers : [req.user._id],
      scheduledAt: new Date(scheduledAt),
      durationMinutes: durationMinutes || 45,
      type: type || "TECHNICAL",
      mode: mode || "ONLINE",
      meetingUrl,
      location,
      status: "SCHEDULED",
    });

    // Advance application status to INTERVIEW if needed
    if (["APPLIED", "SCREENING", "SHORTLISTED"].includes(application.status)) {
      application.status = "INTERVIEW";
      application.statusHistory.push({
        status: "INTERVIEW",
        changedBy: req.user._id,
        changedAt: new Date(),
        reason: "Interview Scheduled",
      });
      await application.save();
    }

    // Notify candidate
    await createNotification({
      recipient: application.candidate,
      type: "INTERVIEW_SCHEDULED",
      title: "Interview Scheduled",
      message: `An interview has been scheduled for "${application.job.title}" on ${new Date(scheduledAt).toLocaleString()}`,
      entityType: "Interview",
      entityId: interview._id,
    });

    await logAudit({ actor: req.user._id, action: "INTERVIEW_SCHEDULED", entityType: "Interview", entityId: interview._id, req });

    return sendSuccess(res, { interview }, "Interview scheduled successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const getInterviews = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};

    if (req.user.role === "CANDIDATE") {
      filter.candidate = req.user._id;
    } else if (req.user.role === "RECRUITER") {
      filter.interviewers = req.user._id;
    }

    if (req.query.status) filter.status = req.query.status;

    const [interviews, total] = await Promise.all([
      Interview.find(filter)
        .populate("candidate", "name email phone")
        .populate("job", "title")
        .populate("interviewers", "name email")
        .sort({ scheduledAt: -1 })
        .skip(skip)
        .limit(limit),
      Interview.countDocuments(filter),
    ]);

    return sendSuccess(res, interviews, "Interviews fetched", 200, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

export const getInterviewById = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.interviewId)
      .populate("candidate", "name email phone")
      .populate({ path: "job", populate: { path: "company", select: "name logo" } })
      .populate("interviewers", "name email")
      .populate("evaluation.evaluatedBy", "name email");

    if (!interview) {
      return sendError(res, "Interview not found", 404, "NOT_FOUND");
    }

    const isCandidate = interview.candidate._id.toString() === req.user._id.toString();
    const isInterviewer = interview.interviewers.some((id) => id._id.toString() === req.user._id.toString());
    const isAdmin = req.user.role === "ADMIN";

    if (!isCandidate && !isInterviewer && !isAdmin) {
      return sendError(res, "Not authorized to view this interview", 403, "FORBIDDEN");
    }

    const doc = interview.toObject();
    if (isCandidate && doc.evaluation && !doc.evaluation.shareableWithCandidate) {
      delete doc.evaluation;
    }

    return sendSuccess(res, { interview: doc }, "Interview details fetched");
  } catch (error) {
    next(error);
  }
};

export const updateInterview = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return sendError(res, "Interview not found", 404, "NOT_FOUND");
    }

    const isInterviewer = interview.interviewers.some((id) => id.toString() === req.user._id.toString());
    if (!isInterviewer && req.user.role !== "ADMIN") {
      return sendError(res, "Not authorized to update interview", 403, "FORBIDDEN");
    }

    const updated = await Interview.findByIdAndUpdate(interviewId, { $set: req.body }, { new: true, runValidators: true });

    return sendSuccess(res, { interview: updated }, "Interview updated successfully");
  } catch (error) {
    next(error);
  }
};

export const cancelInterview = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    const { reason } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return sendError(res, "Interview not found", 404, "NOT_FOUND");
    }

    interview.status = "CANCELLED";
    interview.cancellationReason = reason || "Cancelled by recruiter";
    await interview.save();

    await createNotification({
      recipient: interview.candidate,
      type: "INTERVIEW_CANCELLED",
      title: "Interview Cancelled",
      message: `Your interview scheduled for ${interview.scheduledAt.toLocaleString()} has been cancelled.`,
      entityType: "Interview",
      entityId: interview._id,
    });

    await logAudit({ actor: req.user._id, action: "INTERVIEW_CANCELLED", entityType: "Interview", entityId: interview._id, req });

    return sendSuccess(res, { interview }, "Interview cancelled successfully");
  } catch (error) {
    next(error);
  }
};

export const evaluateInterview = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    const { rating, feedback, strengths, weaknesses, decision, shareableWithCandidate, candidateFeedback } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return sendError(res, "Interview not found", 404, "NOT_FOUND");
    }

    interview.evaluation = {
      rating,
      feedback,
      strengths,
      weaknesses,
      decision,
      shareableWithCandidate: !!shareableWithCandidate,
      candidateFeedback,
      evaluatedBy: req.user._id,
      evaluatedAt: new Date(),
    };
    interview.status = "COMPLETED";
    await interview.save();

    await logAudit({ actor: req.user._id, action: "INTERVIEW_EVALUATED", entityType: "Interview", entityId: interview._id, req });

    return sendSuccess(res, { interview }, "Interview evaluated successfully");
  } catch (error) {
    next(error);
  }
};
