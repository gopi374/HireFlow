import Interview from "../models/Interview.js";
import Application from "../models/Application.js";
import { getPagination } from "../utils/response.js";

// SCHEDULE New Interview
export async function scheduleInterview(req, res) {
  const {
    applicationId,
    scheduledAt,
    durationMinutes,
    type,
    mode,
    meetingUrl,
    location,
    interviewers,
  } = req.body || {};

  if (!applicationId || !scheduledAt) {
    return res.status(400).json({
      success: false,
      message: "Application ID and scheduled time are required",
    });
  }

  try {
    const application = await Application.findById(applicationId).populate("job");
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (application.job.recruiter.toString() !== req.user._id.toString() && req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to schedule interviews for this application",
      });
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

    // Advance application status to INTERVIEW if not already
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

    // Notify Candidate
    await createNotification({
      recipient: application.candidate,
      type: "INTERVIEW_SCHEDULED",
      title: "Interview Scheduled",
      message: `An interview has been scheduled for "${application.job.title}" on ${new Date(scheduledAt).toLocaleString()}`,
      entityType: "Interview",
      entityId: interview._id,
    });


    return res.status(201).json({
      success: true,
      message: "Interview scheduled successfully !!",
      interview,
    });
  } catch (err) {
    console.error("Schedule Interview Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// GET Interviews List (with role-based filtering)
export async function getInterviews(req, res) {
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

    return res.status(200).json({
      success: true,
      message: "Interviews fetched successfully",
      data: interviews,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Get Interviews Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// GET Single Interview by ID
export async function getInterviewById(req, res) {
  const { interviewId } = req.params;

  try {
    const interview = await Interview.findById(interviewId)
      .populate("candidate", "name email phone")
      .populate({ path: "job", populate: { path: "company", select: "name logo" } })
      .populate("interviewers", "name email")
      .populate("evaluation.evaluatedBy", "name email");

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    const isCandidate = interview.candidate._id.toString() === req.user._id.toString();
    const isInterviewer = interview.interviewers.some((id) => id._id.toString() === req.user._id.toString());
    const isAdmin = req.user.role === "ADMIN";

    if (!isCandidate && !isInterviewer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this interview",
      });
    }

    const doc = interview.toObject();
    if (isCandidate && doc.evaluation && !doc.evaluation.shareableWithCandidate) {
      delete doc.evaluation;
    }

    return res.status(200).json({
      success: true,
      interview: doc,
    });
  } catch (err) {
    console.error("Get Interview By ID Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// UPDATE Interview Details
export async function updateInterview(req, res) {
  const { interviewId } = req.params;

  try {
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    const isInterviewer = interview.interviewers.some((id) => id.toString() === req.user._id.toString());
    if (!isInterviewer && req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update interview",
      });
    }

    const updated = await Interview.findByIdAndUpdate(
      interviewId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Interview updated successfully",
      interview: updated,
    });
  } catch (err) {
    console.error("Update Interview Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// CANCEL Interview
export async function cancelInterview(req, res) {
  const { interviewId } = req.params;
  const { reason } = req.body || {};

  try {
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    interview.status = "CANCELLED";
    interview.cancellationReason = reason || "Cancelled by recruiter";
    await interview.save();

    // Notify candidate
    await createNotification({
      recipient: interview.candidate,
      type: "INTERVIEW_CANCELLED",
      title: "Interview Cancelled",
      message: `Your interview scheduled for ${interview.scheduledAt.toLocaleString()} has been cancelled.`,
      entityType: "Interview",
      entityId: interview._id,
    });


    return res.status(200).json({
      success: true,
      message: "Interview cancelled successfully",
      interview,
    });
  } catch (err) {
    console.error("Cancel Interview Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// EVALUATE Interview Feedback
export async function evaluateInterview(req, res) {
  const { interviewId } = req.params;
  const { rating, feedback, strengths, weaknesses, decision, shareableWithCandidate, candidateFeedback } = req.body || {};

  try {
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    interview.evaluation = {
      rating,
      feedback,
      strengths,
      weaknesses,
      decision,
      shareableWithCandidate: Boolean(shareableWithCandidate),
      candidateFeedback,
      evaluatedBy: req.user._id,
      evaluatedAt: new Date(),
    };
    interview.status = "COMPLETED";
    await interview.save();


    return res.status(200).json({
      success: true,
      message: "Interview evaluation submitted successfully",
      interview,
    });
  } catch (err) {
    console.error("Evaluate Interview Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}
