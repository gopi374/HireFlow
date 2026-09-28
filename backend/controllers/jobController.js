import Job from "../models/Job.js";
import Company from "../models/Company.js";
import { getPagination } from "../utils/response.js";

// GET All Jobs with search, filters, and pagination
export async function getJobs(req, res) {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, location, workMode, employmentType, skills, minSalary, companyId, status, sort } = req.query;

    const filter = {};

    // Candidates and public visitors only see PUBLISHED jobs
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
      Job.find(filter)
        .populate("company", "name logo location industry verificationStatus")
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      Job.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Jobs fetched successfully",
      data: jobs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Get Jobs Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// GET Job by ID
export async function getJobById(req, res) {
  const { jobId } = req.params;

  try {
    const job = await Job.findById(jobId)
      .populate("company", "name description logo website location industry verificationStatus")
      .populate("recruiter", "name email");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Only allow recruiter/admin to see unpublished jobs
    if (job.status !== "PUBLISHED") {
      if (!req.user || (req.user.role !== "ADMIN" && job.recruiter._id.toString() !== req.user._id.toString())) {
        return res.status(403).json({
          success: false,
          message: "Job is not available for public view",
        });
      }
    }

    return res.status(200).json({
      success: true,
      job,
    });
  } catch (err) {
    console.error("Get Job By ID Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// CREATE New Job
export async function createJob(req, res) {
  const {
    title,
    companyId,
    description,
    summary,
    responsibilities,
    requirements,
    skills,
    location,
    workMode,
    employmentType,
    type,
    experience,
    salary,
    salaryMin,
    salaryMax,
    currency,
    deadline,
    status = "PUBLISHED",
  } = req.body || {};

  const finalDescription = description || summary || title;

  if (!title || !location) {
    return res.status(400).json({
      success: false,
      message: "Title and location are required",
    });
  }

  try {
    let targetCompany;
    if (companyId) {
      targetCompany = await Company.findById(companyId);
    } else {
      targetCompany = await Company.findOne({
        $or: [{ owner: req.user._id }, { recruiterIds: req.user._id }],
      });
    }

    if (!targetCompany) {
      targetCompany = await Company.create({
        name: req.user.name ? `${req.user.name}'s Company` : "HireFlow Enterprise",
        description: "Technology & Software Development Solutions",
        location: location || "Remote",
        owner: req.user._id,
        recruiterIds: [req.user._id],
        verificationStatus: "VERIFIED",
      });
    }

    const formattedSkills = Array.isArray(skills)
      ? skills.map((s) => String(s).trim().toLowerCase())
      : typeof skills === "string"
      ? skills.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
      : [];

    let parsedWorkMode = "HYBRID";
    if (workMode) {
      const modeStr = String(workMode).toUpperCase();
      if (modeStr.includes("REMOTE")) parsedWorkMode = "REMOTE";
      else if (modeStr.includes("SITE") || modeStr.includes("OFFICE")) parsedWorkMode = "ON_SITE";
      else parsedWorkMode = "HYBRID";
    }

    const rawType = employmentType || type;
    let parsedEmploymentType = "FULL_TIME";
    if (rawType) {
      const typeStr = String(rawType).toUpperCase();
      if (typeStr.includes("PART")) parsedEmploymentType = "PART_TIME";
      else if (typeStr.includes("CONTRACT")) parsedEmploymentType = "CONTRACT";
      else if (typeStr.includes("INTERN")) parsedEmploymentType = "INTERNSHIP";
      else parsedEmploymentType = "FULL_TIME";
    }

    let parsedSalary = { min: 0, max: 0, currency: currency || "INR" };
    if (salary && typeof salary === "object") {
      parsedSalary = {
        min: Number(salary.min) || 0,
        max: Number(salary.max) || 0,
        currency: salary.currency || currency || "INR",
      };
    } else if (salaryMin || salaryMax) {
      parsedSalary = {
        min: Number(salaryMin) || 0,
        max: Number(salaryMax) || 0,
        currency: currency || "INR",
      };
    }

    let parsedExperience = { min: 0, max: 0 };
    if (experience && typeof experience === "object") {
      parsedExperience = {
        min: Number(experience.min) || 0,
        max: Number(experience.max) || 0,
      };
    } else if (experience) {
      const expNum = Number(experience) || 0;
      parsedExperience = { min: expNum, max: expNum ? expNum + 3 : 0 };
    }

    const formattedResponsibilities = Array.isArray(responsibilities)
      ? responsibilities
      : typeof responsibilities === "string"
      ? responsibilities.split("\n").map((r) => r.trim()).filter(Boolean)
      : [];

    const formattedRequirements = Array.isArray(requirements)
      ? requirements
      : typeof requirements === "string"
      ? requirements.split("\n").map((r) => r.trim()).filter(Boolean)
      : [];

    const job = await Job.create({
      title: title.trim(),
      company: targetCompany._id,
      recruiter: req.user._id,
      description: finalDescription,
      responsibilities: formattedResponsibilities,
      requirements: formattedRequirements,
      skills: formattedSkills,
      location: location.trim(),
      workMode: parsedWorkMode,
      employmentType: parsedEmploymentType,
      experience: parsedExperience,
      salary: parsedSalary,
      deadline: deadline || undefined,
      status: status || "PUBLISHED",
    });

    const populatedJob = await Job.findById(job._id).populate("company", "name logo location industry verificationStatus");

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      job: populatedJob,
      data: populatedJob,
    });
  } catch (err) {
    console.error("Create Job Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server Error !",
    });
  }
}

// UPDATE Job
export async function updateJob(req, res) {
  const { jobId } = req.params;

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.status === "ARCHIVED") {
      return res.status(400).json({
        success: false,
        message: "Archived jobs cannot be modified",
      });
    }

    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this job",
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { $set: req.body },
      { new: true, runValidators: true }
    );


    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (err) {
    console.error("Update Job Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// PUBLISH Job
export async function publishJob(req, res) {
  const { jobId } = req.params;

  try {
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
        message: "Not authorized to publish this job",
      });
    }

    job.status = "PUBLISHED";
    await job.save();


    return res.status(200).json({
      success: true,
      message: "Job published successfully",
      job,
    });
  } catch (err) {
    console.error("Publish Job Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// CLOSE Job
export async function closeJob(req, res) {
  const { jobId } = req.params;

  try {
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
        message: "Not authorized to close this job",
      });
    }

    job.status = "CLOSED";
    await job.save();


    return res.status(200).json({
      success: true,
      message: "Job closed successfully",
      job,
    });
  } catch (err) {
    console.error("Close Job Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// DELETE Job
export async function deleteJob(req, res) {
  const { jobId } = req.params;

  try {
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
        message: "Not authorized to delete this job",
      });
    }

    await Job.findByIdAndDelete(jobId);


    return res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (err) {
    console.error("Delete Job Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}
