import Application from "../models/Application.js";
import Job from "../models/Job.js";
import CandidateProfile from "../models/CandidateProfile.js";
import { getPagination } from "../utils/response.js";
import { createNotification } from "../utils/notification.js";

const VALID_STATUS_TRANSITIONS = {
  APPLIED: ["SCREENING", "REJECTED", "WITHDRAWN"],
  SCREENING: ["SHORTLISTED", "REJECTED", "WITHDRAWN"],
  SHORTLISTED: ["INTERVIEW", "REJECTED", "WITHDRAWN"],
  INTERVIEW: ["SELECTED", "REJECTED", "WITHDRAWN"],
  SELECTED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

// APPLY for a Job
export async function applyToJob(req, res) {
  const { jobId } = req.params;
  const { resumeUrl, resumeId, coverLetter, answers } = req.body || {};

  try {
    const job = await Job.findById(jobId).populate("company");
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.status !== "PUBLISHED") {
      return res.status(400).json({
        success: false,
        message: "This job is not currently accepting applications",
      });
    }

    if (job.deadline && new Date(job.deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Application deadline for this job has passed",
      });
    }

    // Check duplicate application
    const existing = await Application.findOne({
      candidate: req.user._id,
      job: jobId,
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You have already applied to this job",
      });
    }

    let finalResumeUrl = resumeUrl;
    if (!finalResumeUrl) {
      const profile = await CandidateProfile.findOne({ user: req.user._id });
      if (resumeId && profile?.resumes?.length) {
        const found = profile.resumes.find((r) => r._id?.toString() === resumeId || r.id === resumeId);
        if (found) finalResumeUrl = found.fileUrl;
      }
      if (!finalResumeUrl) {
        const primaryResume = profile?.resumes?.find((r) => r.isPrimary) || profile?.resumes?.[0];
        if (!primaryResume) {
          return res.status(400).json({
            success: false,
            message: "Please upload or select a resume to apply",
          });
        }
        finalResumeUrl = primaryResume.fileUrl;
      }
    }

    const application = await Application.create({
      candidate: req.user._id,
      job: jobId,
      resumeUrl: finalResumeUrl,
      coverLetter,
      answers: answers || [],
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

    // Notify recruiter about new applicant
    await createNotification({
      recipient: job.recruiter,
      type: "NEW_APPLICATION",
      title: "New Job Application",
      message: `${req.user.name} applied for "${job.title}"`,
      entityType: "Application",
      entityId: application._id,
    });


    return res.status(201).json({
      success: true,
      message: "Application submitted successfully !!",
      application,
    });
  } catch (err) {
    console.error("Apply Job Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// GET All Applications (Role-based access: Recruiter sees applications for their jobs, Candidate sees own, Admin sees all)
export async function getApplications(req, res) {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status, jobId, candidateId } = req.query;

    const filter = {};

    if (req.user.role === "RECRUITER") {
      const recruiterJobs = await Job.find({ recruiter: req.user._id }).select("_id");
      const jobIds = recruiterJobs.map((j) => j._id);
      if (jobId) {
        if (jobIds.some((id) => id.toString() === jobId.toString())) {
          filter.job = jobId;
        } else {
          filter.job = { $in: [] };
        }
      } else {
        filter.job = { $in: jobIds };
      }
    } else if (req.user.role === "CANDIDATE") {
      filter.candidate = req.user._id;
      if (jobId) filter.job = jobId;
    } else if (req.user.role === "ADMIN") {
      if (jobId) filter.job = jobId;
      if (candidateId) filter.candidate = candidateId;
    }

    if (status) {
      filter.status = status;
    }

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate("candidate", "name email phone")
        .populate({
          path: "job",
          select: "title company location employmentType workMode status",
          populate: { path: "company", select: "name logo location" },
        })
        .populate("statusHistory.changedBy", "name email")
        .populate("recruiterNotes.author", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Application.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Applications fetched successfully",
      data: applications,
      applications,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Get Applications Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// GET All Applications for a Specific Job (Recruiter)
export async function getJobApplications(req, res) {
  const { jobId } = req.params;

  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status } = req.query;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view applications for this job",
      });
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

    return res.status(200).json({
      success: true,
      message: "Applications fetched successfully",
      data: applications,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Get Job Applications Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// GET Application by ID
export async function getApplicationById(req, res) {
  const { applicationId } = req.params;

  try {
    const application = await Application.findById(applicationId)
      .populate("candidate", "name email phone")
      .populate({ path: "job", populate: { path: "company", select: "name logo" } })
      .populate("statusHistory.changedBy", "name email")
      .populate("recruiterNotes.author", "name");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const isCandidate = application.candidate._id.toString() === req.user._id.toString();
    const isRecruiter = application.job?.recruiter?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "ADMIN";

    if (!isCandidate && !isRecruiter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to application",
      });
    }

    const appDoc = application.toObject();
    if (isCandidate && !isAdmin) {
      delete appDoc.recruiterNotes;
    }

    return res.status(200).json({
      success: true,
      application: appDoc,
    });
  } catch (err) {
    console.error("Get Application Details Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// UPDATE Application Status
export async function updateApplicationStatus(req, res) {
  const { applicationId } = req.params;
  const { status, reason } = req.body || {};

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
        message: "Not authorized to update application status",
      });
    }

    const ALL_STATUSES = ["APPLIED", "SCREENING", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED", "WITHDRAWN"];
    if (!ALL_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status "${status}". Allowed values: ${ALL_STATUSES.join(", ")}`,
      });
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


    return res.status(200).json({
      success: true,
      message: `Application status updated to ${status}`,
      application,
    });
  } catch (err) {
    console.error("Update Application Status Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// ADD Recruiter Internal Note
export async function addRecruiterNote(req, res) {
  const { applicationId } = req.params;
  const { note } = req.body || {};

  if (!note) {
    return res.status(400).json({
      success: false,
      message: "Note text is required",
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
        message: "Not authorized to add notes to this application",
      });
    }

    application.recruiterNotes.push({ note, author: req.user._id });
    await application.save();

    return res.status(200).json({
      success: true,
      message: "Recruiter note added successfully",
      notes: application.recruiterNotes,
    });
  } catch (err) {
    console.error("Add Recruiter Note Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// WITHDRAW Application (Candidate)
export async function withdrawApplication(req, res) {
  const { applicationId } = req.params;

  try {
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (application.candidate.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only withdraw your own applications",
      });
    }

    if (["SELECTED", "REJECTED", "WITHDRAWN"].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw application in ${application.status} state`,
      });
    }

    application.status = "WITHDRAWN";
    application.statusHistory.push({
      status: "WITHDRAWN",
      changedBy: req.user._id,
      changedAt: new Date(),
      reason: "Candidate withdrew application",
    });
    await application.save();

    return res.status(200).json({
      success: true,
      message: "Application withdrawn successfully",
      application,
    });
  } catch (err) {
    console.error("Withdraw Application Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}
