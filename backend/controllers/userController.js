import User from "../models/User.js";
import CandidateProfile from "../models/CandidateProfile.js";
import Application from "../models/Application.js";
import Interview from "../models/Interview.js";
import { getPagination } from "../utils/response.js";

// UPDATE Current User Account
export async function updateMe(req, res) {
  const { name, phone } = req.body || {};

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      user,
    });
  } catch (err) {
    console.error("Update User Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// UPDATE Candidate Profile
export async function updateCandidateProfile(req, res) {
  const {
    headline,
    summary,
    location,
    skills,
    experience,
    education,
    projects,
    certifications,
    links,
  } = req.body || {};

  try {
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

    return res.status(200).json({
      success: true,
      message: "Candidate profile updated successfully",
      profile,
    });
  } catch (err) {
    console.error("Update Candidate Profile Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// UPLOAD Resume
export async function uploadResume(req, res) {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Please select and upload a resume file",
    });
  }

  try {
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

    // Set other resumes as non-primary
    profile.resumes.forEach((r) => {
      r.isPrimary = false;
    });

    profile.resumes.push(resumeData);
    await profile.save();

    return res.status(201).json({
      success: true,
      message: "Resume uploaded successfully",
      resume: resumeData,
      profile,
    });
  } catch (err) {
    console.error("Upload Resume Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// SAVE / BOOKMARK Job
export async function toggleSaveJob(req, res) {
  const { jobId } = req.params;

  try {
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

    return res.status(200).json({
      success: true,
      isSaved: !isSaved,
      message: !isSaved ? "Job saved successfully" : "Job unsaved successfully",
    });
  } catch (err) {
    console.error("Toggle Save Job Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// GET Candidate's Applications
export async function getMyApplications(req, res) {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { candidate: req.user._id };

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate({
          path: "job",
          populate: { path: "company", select: "name logo location" },
        })
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
    console.error("Get Applications Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// GET Candidate's Interviews
export async function getMyInterviews(req, res) {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { candidate: req.user._id };

    const [interviews, total] = await Promise.all([
      Interview.find(filter)
        .populate({
          path: "job",
          select: "title company",
          populate: { path: "company", select: "name logo" },
        })
        .populate("interviewers", "name email")
        .sort({ scheduledAt: -1 })
        .skip(skip)
        .limit(limit),
      Interview.countDocuments(filter),
    ]);

    const sanitized = interviews.map((item) => {
      const doc = item.toObject();
      if (doc.evaluation && !doc.evaluation.shareableWithCandidate) {
        delete doc.evaluation;
      }
      return doc;
    });

    return res.status(200).json({
      success: true,
      message: "Interviews fetched successfully",
      data: sanitized,
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
