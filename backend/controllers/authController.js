import jwt from "jsonwebtoken";
import crypto from "crypto";
import validator from "validator";
import User from "../models/User.js";
import CandidateProfile from "../models/CandidateProfile.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { logAudit } from "../utils/audit.js";

const generateTokens = (user) => {
  const payload = { id: user._id, role: user.role, email: user.email };
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "default_access_secret", {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "1d",
  });
  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET || "default_refresh_secret", {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  });
  return { accessToken, refreshToken };
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role = "CANDIDATE", phone } = req.body;

    if (!name || !email || !password) {
      return sendError(res, "Name, email, and password are required.", 400, "MISSING_FIELDS");
    }

    if (!validator.isEmail(email)) {
      return sendError(res, "Please provide a valid email address.", 400, "INVALID_EMAIL");
    }

    if (password.length < 8) {
      return sendError(res, "Password must be at least 8 characters long.", 400, "WEAK_PASSWORD");
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return sendError(res, "An account with this email already exists.", 409, "EMAIL_EXISTS");
    }

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role,
      phone,
      isVerified: true, // auto-verified for MVP or can generate verification token
    });

    if (user.role === "CANDIDATE") {
      await CandidateProfile.create({ user: user._id });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    await User.findByIdAndUpdate(user._id, { $push: { refreshTokens: refreshToken } });

    await logAudit({ actor: user._id, action: "USER_REGISTER", entityType: "User", entityId: user._id, req });

    return sendSuccess(
      res,
      {
        user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified },
        tokens: { accessToken, refreshToken },
      },
      "Account created successfully",
      201
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, "Email and password are required.", 400, "MISSING_CREDENTIALS");
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password +refreshTokens");
    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, "Invalid email or password.", 401, "INVALID_CREDENTIALS");
    }

    if (user.status === "SUSPENDED") {
      return sendError(res, "This account is suspended.", 403, "ACCOUNT_SUSPENDED");
    }

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshTokens = [...(user.refreshTokens || []).slice(-4), refreshToken];
    await user.save({ validateBeforeSave: false });

    await logAudit({ actor: user._id, action: "USER_LOGIN", entityType: "User", entityId: user._id, req });

    return sendSuccess(
      res,
      {
        user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified },
        tokens: { accessToken, refreshToken },
      },
      "Login successful"
    );
  } catch (error) {
    next(error);
  }
};

export const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return sendError(res, "Refresh token is required.", 400, "MISSING_TOKEN");
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "default_refresh_secret");
    const user = await User.findById(decoded.id).select("+refreshTokens");

    if (!user || !user.refreshTokens?.includes(refreshToken)) {
      return sendError(res, "Invalid or revoked refresh token.", 401, "REVOKED_TOKEN");
    }

    const tokens = generateTokens(user);
    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken).concat(tokens.refreshToken);
    await user.save({ validateBeforeSave: false });

    return sendSuccess(res, { tokens }, "Tokens refreshed successfully");
  } catch (error) {
    return sendError(res, "Invalid or expired refresh token.", 401, "INVALID_REFRESH_TOKEN");
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (req.user && refreshToken) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { refreshTokens: refreshToken } });
    }
    return sendSuccess(res, null, "Logged out successfully");
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = null;
    if (user.role === "CANDIDATE") {
      profile = await CandidateProfile.findOne({ user: user._id });
    }
    return sendSuccess(res, { user, profile }, "Current user fetched");
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return sendError(res, "Current and new password are required.", 400, "MISSING_FIELDS");
    }
    if (newPassword.length < 8) {
      return sendError(res, "New password must be at least 8 characters long.", 400, "WEAK_PASSWORD");
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.comparePassword(currentPassword))) {
      return sendError(res, "Current password is incorrect.", 400, "INCORRECT_PASSWORD");
    }

    user.password = newPassword;
    user.refreshTokens = []; // Revoke active sessions on password change
    await user.save();

    await logAudit({ actor: user._id, action: "PASSWORD_CHANGED", entityType: "User", entityId: user._id, req });

    return sendSuccess(res, null, "Password changed successfully. Please log in again.");
  } catch (error) {
    next(error);
  }
};
