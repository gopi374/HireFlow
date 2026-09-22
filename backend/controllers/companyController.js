import Company from "../models/Company.js";
import { sendSuccess, sendError, getPagination } from "../utils/response.js";
import { logAudit } from "../utils/audit.js";

export const createCompany = async (req, res, next) => {
  try {
    const { name, description, website, logo, location, industry, size } = req.body;

    if (!name) {
      return sendError(res, "Company name is required.", 400, "MISSING_NAME");
    }

    const existing = await Company.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (existing) {
      return sendError(res, "A company with this name already exists.", 409, "COMPANY_EXISTS");
    }

    const company = await Company.create({
      name,
      description,
      website,
      logo,
      location,
      industry,
      size,
      owner: req.user._id,
      recruiterIds: [req.user._id],
    });

    await logAudit({ actor: req.user._id, action: "COMPANY_CREATED", entityType: "Company", entityId: company._id, req });

    return sendSuccess(res, { company }, "Company created successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const getCompanies = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};

    if (req.query.industry) filter.industry = req.query.industry;
    if (req.query.search) filter.name = { $regex: req.query.search, $options: "i" };

    const [companies, total] = await Promise.all([
      Company.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Company.countDocuments(filter),
    ]);

    return sendSuccess(res, companies, "Companies fetched", 200, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

export const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.companyId).populate("owner recruiterIds", "name email");
    if (!company) {
      return sendError(res, "Company not found", 404, "NOT_FOUND");
    }
    return sendSuccess(res, { company }, "Company fetched");
  } catch (error) {
    next(error);
  }
};

export const updateCompany = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const company = await Company.findById(companyId);

    if (!company) {
      return sendError(res, "Company not found", 404, "NOT_FOUND");
    }

    // Ownership check: must be owner or listed recruiter or admin
    const isOwner = company.owner.toString() === req.user._id.toString();
    const isRecruiter = company.recruiterIds.some((id) => id.toString() === req.user._id.toString());
    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isRecruiter && !isAdmin) {
      return sendError(res, "You are not authorized to update this company", 403, "FORBIDDEN");
    }

    const { name, description, website, logo, location, industry, size } = req.body;
    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      { name, description, website, logo, location, industry, size },
      { new: true, runValidators: true }
    );

    return sendSuccess(res, { company: updatedCompany }, "Company updated successfully");
  } catch (error) {
    next(error);
  }
};

export const requestVerification = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { documents, notes } = req.body;

    const company = await Company.findById(companyId);
    if (!company) {
      return sendError(res, "Company not found", 404, "NOT_FOUND");
    }

    if (company.owner.toString() !== req.user._id.toString() && req.user.role !== "ADMIN") {
      return sendError(res, "Only the company owner can submit for verification", 403, "FORBIDDEN");
    }

    company.verificationStatus = "PENDING";
    if (documents) company.verificationDocuments = documents;
    if (notes) company.verificationNotes = notes;
    await company.save();

    await logAudit({ actor: req.user._id, action: "COMPANY_VERIFICATION_REQUESTED", entityType: "Company", entityId: company._id, req });

    return sendSuccess(res, { company }, "Verification request submitted");
  } catch (error) {
    next(error);
  }
};
