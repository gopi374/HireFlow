import Application from "../models/Application.js";
import Job from "../models/Job.js";
import CandidateProfile from "../models/CandidateProfile.js";
import { sendSuccess, sendError, getPagination } from "../utils/response.js";
import { logAudit, createNotification } from "../utils/audit.js";

const VALID_STATUS_TRANSITIONS = {
  APPLIED: ["SCREENING", "REJECTED", "WITHDRAWN"],
  SCREENING: ["SHORTLISTED", "REJECTED", "WITHDRAWN"],
  SHORTLISTED: ["INTERVIEW", "REJECTED", "WITHDRAWN"],
  INTERVIEW: ["SELECTED", "REJECTED", "WITHDRAWN"],
  SELECTED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

export const applyToJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { resumeUrl, coverLetter, answers } = req.body;

    const job = await Job.findById(jobId).populate("company");
    if (!job) {
      return sendError(res, "Job not found", 404, "NOT_FOUND");
    }

    if (job.status !== "PUBLISHED") {
      return sendError(res, "This job is no longer accepting applications", 400, "JOB_NOT_ACCEPTING");
    }

    if (job.deadline && new Date(job.deadline) < new Date()) {
      return sendError(res, "Application deadline for this job has expired", 400, "DEADLINE_PASSED");
    }

    // Check duplicate
    const existing = await Application.findOne({ candidate: req.user._id, job: jobId });
    if (existing) {
      return sendError(res, "You have already applied to this job.", 409, "DUPLICATE_APPLICATION");
    }

    let finalResumeUrl = resumeUrl;
    if (!finalResumeUrl) {
      const profile = await CandidateProfile.findOne({ user: req.user._id });
      const primaryResume = profile?.resumes?.find((r) => r.isPrimary) || profile?.resumes?.[0];
      if (!primaryResume) {
        return sendError(res, "Please provide or upload a resume to apply.", 400, "RESUME_REQUIRED");
      }
      finalResumeUrl = primaryResume.fileUrl;
    }

    const application = await Application.create({
      candidate: req.user._id,
      job: jobId,
      resumeUrl: finalResumeUrl,
      coverLetter,
      answers,
      status: "APPLIED",
      statusHistory: [
        {
          status: "APPLIED",
          changedBy: req.user._id,
          changedAt: new Date(),
          reason: "Initial Application Submission",
        },
      ],
    });

    await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });

    // Notify recruiter
    await createNotification({
      recipient: job.recruiter,
      type: "NEW_APPLICATION",
      title: "New Job Application",
      message: `${req.user.name} applied for "${job.title}"`,
      entityType: "Application",
      entityId: application._id,
    });

    await logAudit({ actor: req.user._id, action: "APPLICATION_SUBMITTED", entityType: "Application", entityId: application._id, req });

    return sendSuccess(res, { application }, "Application submitted successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { page, limit, skip } = getPagination(req.query);
    const { status } = req.query;

    const job = await Job.findById(jobId);
    if (!job) {
      return sendError(res, "Job not found", 404, "NOT_FOUND");
    }

    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== "ADMIN") {
      return sendError(res, "Not authorized to view applications for this job", 403, "FORBIDDEN");
    }

    const filter = { job: jobId };
    if (status) filter.status = status;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate("candidate", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Application.countDocuments(filter),
    ]);

    return sendSuccess(res, applications, "Applications fetched", 200, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const application = await Application.findById(applicationId)
      .populate("candidate", "name email phone")
      .populate({ path: "job", populate: { path: "company", select: "name logo" } })
      .populate("statusHistory.changedBy", "name email")
      .populate("recruiterNotes.author", "name");

    if (!application) {
      return sendError(res, "Application not found", 404, "NOT_FOUND");
    }

    const isCandidate = application.candidate._id.toString() === req.user._id.toString();
    const isRecruiter = application.job.recruiter?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "ADMIN";

    if (!isCandidate && !isRecruiter && !isAdmin) {
      return sendError(res, "Unauthorized access to application", 403, "FORBIDDEN");
    }

    const appObj = application.toObject();
    // Hide recruiter internal notes from candidate
    if (isCandidate && !isAdmin) {
      delete appObj.recruiterNotes;
    }

    return sendSuccess(res, { application: appObj }, "Application details fetched");
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { status, reason } = req.body;

    const application = await Application.findById(applicationId).populate("job");
    if (!application) {
      return sendError(res, "Application not found", 404, "NOT_FOUND");
    }

    if (application.job.recruiter.toString() !== req.user._id.toString() && req.user.role !== "ADMIN") {
      return sendError(res, "Not authorized to update application status", 403, "FORBIDDEN");
    }

    const allowed = VALID_STATUS_TRANSITIONS[application.status];
    if (!allowed || !allowed.includes(status)) {
      return sendError(
        res,
        `Invalid status transition from ${application.status} to ${status}. Allowed: ${allowed?.join(", ") || "none"}`,
        400,
        "INVALID_STATUS_TRANSITION"
      );
    }

    application.status = status;
    application.statusHistory.push({
      status,
      changedBy: req.user._id,
      changedAt: new Date(),
      reason,
    });
    await application.save();

    // Notify Candidate
    await createNotification({
      recipient: application.candidate,
      type: "APPLICATION_STATUS",
      title: "Application Status Update",
      message: `Your application status for "${application.job.title}" was updated to ${status}`,
      entityType: "Application",
      entityId: application._id,
    });

    await logAudit({
      actor: req.user._id,
      action: "APPLICATION_STATUS_UPDATED",
      entityType: "Application",
      entityId: application._id,
      metadata: { newStatus: status, reason },
      req,
    });

    return sendSuccess(res, { application }, `Application status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

export const addRecruiterNote = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { note } = req.body;

    if (!note) {
      return sendError(res, "Note text is required", 400, "MISSING_NOTE");
    }

    const application = await Application.findById(applicationId).populate("job");
    if (!application) {
      return sendError(res, "Application not found", 404, "NOT_FOUND");
    }

    if (application.job.recruiter.toString() !== req.user._id.toString() && req.user.role !== "ADMIN") {
      return sendError(res, "Not authorized to add notes to this application", 403, "FORBIDDEN");
    }

    application.recruiterNotes.push({ note, author: req.user._id });
    await application.save();

    return sendSuccess(res, { notes: application.recruiterNotes }, "Recruiter note added");
  } catch (error) {
    next(error);
  }
};

export const withdrawApplication = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const application = await Application.findById(applicationId);

    if (!application) {
      return sendError(res, "Application not found", 404, "NOT_FOUND");
    }

    if (application.candidate.toString() !== req.user._id.toString()) {
      return sendError(res, "You can only withdraw your own applications", 403, "FORBIDDEN");
    }

    if (["SELECTED", "REJECTED", "WITHDRAWN"].includes(application.status)) {
      return sendError(res, `Cannot withdraw application in ${application.status} state`, 400, "CANNOT_WITHDRAW");
    }

    application.status = "WITHDRAWN";
    application.statusHistory.push({
      status: "WITHDRAWN",
      changedBy: req.user._id,
      changedAt: new Date(),
      reason: "Candidate withdrew application",
    });
    await application.save();

    return sendSuccess(res, { application }, "Application withdrawn successfully");
  } catch (error) {
    next(error);
  }
};
