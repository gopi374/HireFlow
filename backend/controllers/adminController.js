import User from "../models/User.js";
import Company from "../models/Company.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import AuditLog from "../models/AuditLog.js";
import { sendSuccess, sendError, getPagination } from "../utils/response.js";
import { logAudit, createNotification } from "../utils/audit.js";

export const getPlatformStats = async (req, res, next) => {
  try {
    const [totalUsers, totalCandidates, totalRecruiters, totalCompanies, totalJobs, totalApplications] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "CANDIDATE" }),
      User.countDocuments({ role: "RECRUITER" }),
      Company.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
    ]);

    return sendSuccess(res, {
      totalUsers,
      totalCandidates,
      totalRecruiters,
      totalCompanies,
      totalJobs,
      totalApplications,
    }, "Platform statistics fetched");
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return sendSuccess(res, users, "Users list fetched", 200, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!["ACTIVE", "SUSPENDED"].includes(status)) {
      return sendError(res, "Invalid status. Must be ACTIVE or SUSPENDED", 400, "INVALID_STATUS");
    }

    const user = await User.findByIdAndUpdate(userId, { status }, { new: true });
    if (!user) {
      return sendError(res, "User not found", 404, "NOT_FOUND");
    }

    await logAudit({ actor: req.user._id, action: `USER_${status}`, entityType: "User", entityId: user._id, req });

    return sendSuccess(res, { user }, `User status changed to ${status}`);
  } catch (error) {
    next(error);
  }
};

export const verifyCompany = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { verificationStatus, verificationNotes } = req.body;

    if (!["VERIFIED", "REJECTED", "PENDING"].includes(verificationStatus)) {
      return sendError(res, "Invalid verification status", 400, "INVALID_STATUS");
    }

    const company = await Company.findByIdAndUpdate(
      companyId,
      { verificationStatus, verificationNotes },
      { new: true }
    ).populate("owner");

    if (!company) {
      return sendError(res, "Company not found", 404, "NOT_FOUND");
    }

    // Notify owner
    await createNotification({
      recipient: company.owner._id,
      type: "COMPANY_VERIFIED",
      title: "Company Verification Update",
      message: `Your company "${company.name}" verification status is now ${verificationStatus}`,
      entityType: "Company",
      entityId: company._id,
    });

    await logAudit({
      actor: req.user._id,
      action: `COMPANY_VERIFICATION_${verificationStatus}`,
      entityType: "Company",
      entityId: company._id,
      req,
    });

    return sendSuccess(res, { company }, `Company verification status updated to ${verificationStatus}`);
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    if (req.query.entityType) filter.entityType = req.query.entityType;
    if (req.query.action) filter.action = req.query.action;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter).populate("actor", "name email role").sort({ createdAt: -1 }).skip(skip).limit(limit),
      AuditLog.countDocuments(filter),
    ]);

    return sendSuccess(res, logs, "Audit logs fetched", 200, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};
