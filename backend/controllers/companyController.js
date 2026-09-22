import Company from "../models/Company.js";
import { getPagination } from "../utils/response.js";

// CREATE Company Profile
export async function createCompany(req, res) {
  const { name, description, website, logo, location, industry, size } = req.body || {};

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Company name is required",
    });
  }

  try {
    const existing = await Company.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A company with this name already exists",
      });
    }

    const company = await Company.create({
      name: name.trim(),
      description,
      website,
      logo,
      location,
      industry,
      size,
      owner: req.user._id,
      recruiterIds: [req.user._id],
    });


    return res.status(201).json({
      success: true,
      message: "Company created successfully",
      company,
    });
  } catch (err) {
    console.error("Create Company Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// GET All Companies with pagination and search
export async function getCompanies(req, res) {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};

    if (req.query.industry) filter.industry = req.query.industry;
    if (req.query.search) filter.name = { $regex: req.query.search, $options: "i" };

    const [companies, total] = await Promise.all([
      Company.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Company.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Companies fetched successfully",
      data: companies,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Get Companies Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// GET Company by ID
export async function getCompanyById(req, res) {
  const { companyId } = req.params;

  try {
    const company = await Company.findById(companyId).populate("owner recruiterIds", "name email");

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    return res.status(200).json({
      success: true,
      company,
    });
  } catch (err) {
    console.error("Get Company By ID Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// UPDATE Company
export async function updateCompany(req, res) {
  const { companyId } = req.params;

  try {
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Must be company owner, recruiter in the company, or an admin
    const isOwner = company.owner.toString() === req.user._id.toString();
    const isRecruiter = company.recruiterIds?.some((id) => id.toString() === req.user._id.toString());
    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isRecruiter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this company",
      });
    }

    const { name, description, website, logo, location, industry, size } = req.body || {};

    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      { name, description, website, logo, location, industry, size },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Company updated successfully",
      company: updatedCompany,
    });
  } catch (err) {
    console.error("Update Company Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// REQUEST Verification for Company
export async function requestVerification(req, res) {
  const { companyId } = req.params;
  const { documents, notes } = req.body || {};

  try {
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    if (company.owner.toString() !== req.user._id.toString() && req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only the company owner can submit verification requests",
      });
    }

    company.verificationStatus = "PENDING";
    if (documents) company.verificationDocuments = documents;
    if (notes) company.verificationNotes = notes;
    await company.save();


    return res.status(200).json({
      success: true,
      message: "Verification request submitted successfully",
      company,
    });
  } catch (err) {
    console.error("Company Verification Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}
