import Job from "../models/Job.js";
import Company from "../models/Company.js";
import { sendSuccess, sendError, getPagination } from "../utils/response.js";
import { logAudit } from "../utils/audit.js";

export const getJobs = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, location, workMode, employmentType, skills, minSalary, companyId, status, sort } = req.query;

    const filter = {};

    // Default to PUBLISHED unless recruiter/admin is asking with specific status
    if (status) {
      filter.status = status;
    } else if (!req.user || req.user.role === "CANDIDATE") {
      filter.status = "PUBLISHED";
    }

    if (companyId) filter.company = companyId;
    if (location) filter.location = { $regex: location, $options: "i" };
    if (workMode) filter.workMode = workMode;
    if (employmentType) filter.employmentType = employmentType;
    if (skills) {
      const skillsArray = skills.split(",").map((s) => s.trim().toLowerCase());
      filter.skills = { $in: skillsArray };
    }
    if (minSalary) {
      filter["salary.max"] = { $gte: Number(minSalary) };
    }

    if (search) {
      filter.$text = { $search: search };
    }

    let sortOption = { createdAt: -1 };
    if (sort === "salary_high") sortOption = { "salary.max": -1 };
    if (sort === "salary_low") sortOption = { "salary.min": 1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };

    const [jobs, total] = await Promise.all([
      Job.find(filter).populate("company", "name logo location industry verificationStatus").sort(sortOption).skip(skip).limit(limit),
      Job.countDocuments(filter),
    ]);

    return sendSuccess(res, jobs, "Jobs fetched successfully", 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId)
      .populate("company", "name description logo website location industry verificationStatus")
      .populate("recruiter", "name email");

    if (!job) {
      return sendError(res, "Job not found", 404, "NOT_FOUND");
    }

    // If job is not published, only the recruiter/admin can view it
    if (job.status !== "PUBLISHED") {
      if (!req.user || (req.user.role !== "ADMIN" && job.recruiter._id.toString() !== req.user._id.toString())) {
        return sendError(res, "Job is not available for public view", 403, "FORBIDDEN");
      }
    }

    return sendSuccess(res, { job }, "Job details fetched");
  } catch (error) {
    next(error);
  }
};

export const createJob = async (req, res, next) => {
  try {
    const {
      title,
      companyId,
      description,
      responsibilities,
      requirements,
      skills,
      location,
      workMode,
      employmentType,
      experience,
      salary,
      deadline,
      status = "DRAFT",
    } = req.body;

    if (!title || !companyId || !description || !location) {
      return sendError(res, "Title, company, description, and location are required.", 400, "MISSING_FIELDS");
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return sendError(res, "Company not found.", 404, "NOT_FOUND");
    }

    // Verify recruiter belongs to the company
    const isAssociated = company.owner.toString() === req.user._id.toString() || company.recruiterIds.some((id) => id.toString() === req.user._id.toString());
    if (!isAssociated && req.user.role !== "ADMIN") {
      return sendError(res, "You are not authorized to post jobs for this company.", 403, "FORBIDDEN");
    }

    const formattedSkills = Array.isArray(skills) ? skills.map((s) => s.trim().toLowerCase()) : [];

    const job = await Job.create({
      title,
      company: companyId,
      recruiter: req.user._id,
      description,
      responsibilities,
      requirements,
      skills: formattedSkills,
      location,
      workMode,
      employmentType,
      experience,
      salary,
      deadline,
      status,
    });

    await logAudit({ actor: req.user._id, action: "JOB_CREATED", entityType: "Job", entityId: job._id, req });

    return sendSuccess(res, { job }, "Job created successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);

    if (!job) {
      return sendError(res, "Job not found", 404, "NOT_FOUND");
    }

    if (job.status === "ARCHIVED") {
      return sendError(res, "Archived jobs cannot be modified", 400, "JOB_ARCHIVED");
    }

    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== "ADMIN") {
      return sendError(res, "You are not authorized to update this job", 403, "FORBIDDEN");
    }

    const updatedJob = await Job.findByIdAndUpdate(jobId, { $set: req.body }, { new: true, runValidators: true });

    await logAudit({ actor: req.user._id, action: "JOB_UPDATED", entityType: "Job", entityId: job._id, req });

    return sendSuccess(res, { job: updatedJob }, "Job updated successfully");
  } catch (error) {
    next(error);
  }
};

export const publishJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);

    if (!job) {
      return sendError(res, "Job not found", 404, "NOT_FOUND");
    }

    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== "ADMIN") {
      return sendError(res, "Not authorized to publish this job", 403, "FORBIDDEN");
    }

    job.status = "PUBLISHED";
    await job.save();

    await logAudit({ actor: req.user._id, action: "JOB_PUBLISHED", entityType: "Job", entityId: job._id, req });

    return sendSuccess(res, { job }, "Job published successfully");
  } catch (error) {
    next(error);
  }
};

export const closeJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);

    if (!job) {
      return sendError(res, "Job not found", 404, "NOT_FOUND");
    }

    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== "ADMIN") {
      return sendError(res, "Not authorized to close this job", 403, "FORBIDDEN");
    }

    job.status = "CLOSED";
    await job.save();

    await logAudit({ actor: req.user._id, action: "JOB_CLOSED", entityType: "Job", entityId: job._id, req });

    return sendSuccess(res, { job }, "Job closed successfully");
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);

    if (!job) {
      return sendError(res, "Job not found", 404, "NOT_FOUND");
    }

    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== "ADMIN") {
      return sendError(res, "Not authorized to delete this job", 403, "FORBIDDEN");
    }

    await Job.findByIdAndDelete(jobId);

    await logAudit({ actor: req.user._id, action: "JOB_DELETED", entityType: "Job", entityId: jobId, req });

    return sendSuccess(res, null, "Job deleted successfully");
  } catch (error) {
    next(error);
  }
};
