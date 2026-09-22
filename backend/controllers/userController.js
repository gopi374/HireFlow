import User from "../models/User.js";
import CandidateProfile from "../models/CandidateProfile.js";
import Application from "../models/Application.js";
import Interview from "../models/Interview.js";
import { sendSuccess, sendError, getPagination } from "../utils/response.js";

export const updateMe = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone }, { new: true, runValidators: true });
    return sendSuccess(res, { user }, "User profile updated");
  } catch (error) {
    next(error);
  }
};

export const updateCandidateProfile = async (req, res, next) => {
  try {
    const { headline, summary, location, skills, experience, education, projects, certifications, links } = req.body;

    const profile = await CandidateProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        $set: {
          headline,
          summary,
          location,
          skills,
          experience,
          education,
          projects,
          certifications,
          links,
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    return sendSuccess(res, { profile }, "Candidate profile updated successfully");
  } catch (error) {
    next(error);
  }
};

export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, "Please upload a resume file.", 400, "MISSING_FILE");
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const resumeData = {
      fileName: req.file.originalname,
      fileUrl,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      isPrimary: true,
      uploadedAt: new Date(),
    };

    let profile = await CandidateProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await CandidateProfile.create({ user: req.user._id });
    }

    // Set other resumes as non-primary if this one is primary
    profile.resumes.forEach((r) => (r.isPrimary = false));
    profile.resumes.push(resumeData);
    await profile.save();

    return sendSuccess(res, { resume: resumeData, profile }, "Resume uploaded successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const toggleSaveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    let profile = await CandidateProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await CandidateProfile.create({ user: req.user._id });
    }

    const isSaved = profile.savedJobs.includes(jobId);
    if (isSaved) {
      profile.savedJobs.pull(jobId);
    } else {
      profile.savedJobs.push(jobId);
    }
    await profile.save();

    return sendSuccess(res, { isSaved: !isSaved }, !isSaved ? "Job saved" : "Job unsaved");
  } catch (error) {
    next(error);
  }
};

export const getMyApplications = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { candidate: req.user._id };

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate({ path: "job", populate: { path: "company", select: "name logo location" } })
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

export const getMyInterviews = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { candidate: req.user._id };

    const [interviews, total] = await Promise.all([
      Interview.find(filter)
        .populate({ path: "job", select: "title company", populate: { path: "company", select: "name logo" } })
        .populate("interviewers", "name email")
        .sort({ scheduledAt: -1 })
        .skip(skip)
        .limit(limit),
      Interview.countDocuments(filter),
    ]);

    // Strip private internal evaluations if not marked shareable with candidate
    const sanitized = interviews.map((item) => {
      const doc = item.toObject();
      if (doc.evaluation && !doc.evaluation.shareableWithCandidate) {
        delete doc.evaluation;
      }
      return doc;
    });

    return sendSuccess(res, sanitized, "Interviews fetched", 200, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};
