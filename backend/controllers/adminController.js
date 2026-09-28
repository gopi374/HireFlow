import User from "../models/User.js";
import Company from "../models/Company.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import { getPagination } from "../utils/response.js";
import { createNotification } from "../utils/notification.js";

// GET Platform Statistics
export async function getPlatformStats(req, res) {
  try {
    const [
      totalUsers,
      totalCandidates,
      totalRecruiters,
      totalCompanies,
      totalJobs,
      totalApplications,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "CANDIDATE" }),
      User.countDocuments({ role: "RECRUITER" }),
      Company.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      message: "Platform statistics fetched successfully",
      stats: {
        totalUsers,
        totalCandidates,
        totalRecruiters,
        totalCompanies,
        totalJobs,
        totalApplications,
      },
    });
  } catch (err) {
    console.error("Platform Stats Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// LIST All Users with filtering and pagination
export async function listUsers(req, res) {
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

    return res.status(200).json({
      success: true,
      message: "Users list fetched successfully",
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("List Users Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// UPDATE User Account Status (Active / Suspended)
export async function updateUserStatus(req, res) {
  const { userId } = req.params;
  const { status } = req.body || {};

  if (!["ACTIVE", "SUSPENDED"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status. Must be ACTIVE or SUSPENDED",
    });
  }

  try {
    const user = await User.findByIdAndUpdate(userId, { status }, { new: true });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `User status changed to ${status}`,
      user,
    });
  } catch (err) {
    console.error("Update User Status Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// VERIFY or REJECT Company
export async function verifyCompany(req, res) {
  const { companyId } = req.params;
  const { verificationStatus, verificationNotes } = req.body || {};

  if (!["VERIFIED", "REJECTED", "PENDING"].includes(verificationStatus)) {
    return res.status(400).json({
      success: false,
      message: "Invalid verification status. Must be VERIFIED, REJECTED, or PENDING",
    });
  }

  try {
    const company = await Company.findByIdAndUpdate(
      companyId,
      { verificationStatus, verificationNotes },
      { new: true }
    ).populate("owner");

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Send notification to company owner
    if (company.owner) {
      await createNotification({
        recipient: company.owner._id,
        type: "COMPANY_VERIFIED",
        title: "Company Verification Update",
        message: `Your company "${company.name}" verification status is now ${verificationStatus}`,
        entityType: "Company",
        entityId: company._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Company verification status updated to ${verificationStatus}`,
      company,
    });
  } catch (err) {
    console.error("Verify Company Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}
