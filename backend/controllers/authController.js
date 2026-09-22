import User from "../models/User.js";
import CandidateProfile from "../models/CandidateProfile.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "hireflow_jwt_secret_key";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "hireflow_refresh_secret_key";
const TOKEN_EXPIRES = "24h";

// Helper to generate access & refresh tokens
const createTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES }
  );
  const refreshToken = jwt.sign(
    { id: user._id },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

// REGISTER New User
export async function register(req, res) {
  const { name, email, password, role = "CANDIDATE", phone } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required !!",
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Email",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Enter a strong password of at least 8 characters",
    });
  }

  try {
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      phone,
      isVerified: true,
    });

    if (user.role === "CANDIDATE") {
      await CandidateProfile.create({ user: user._id });
    }

    const { accessToken, refreshToken } = createTokens(user);
    await User.findByIdAndUpdate(user._id, { $push: { refreshTokens: refreshToken } });

    return res.status(201).json({
      success: true,
      token: accessToken,
      tokens: { accessToken, refreshToken },
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: "Account Created Successfully !!",
    });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// LOGIN User
export async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Both fields are required !",
    });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password +refreshTokens");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.status === "SUSPENDED") {
      return res.status(403).json({
        success: false,
        message: "Your account is suspended. Please contact admin.",
      });
    }

    const { accessToken, refreshToken } = createTokens(user);
    user.refreshTokens = [...(user.refreshTokens || []).slice(-4), refreshToken];
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      token: accessToken,
      tokens: { accessToken, refreshToken },
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      message: "Login successful !!",
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// REFRESH ACCESS TOKEN
export async function refreshAccessToken(req, res) {
  const { refreshToken } = req.body || {};

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: "Refresh token is required",
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select("+refreshTokens");

    if (!user || !user.refreshTokens?.includes(refreshToken)) {
      return res.status(401).json({
        success: false,
        message: "Invalid or revoked refresh token",
      });
    }

    const tokens = createTokens(user);
    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken).concat(tokens.refreshToken);
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      token: tokens.accessToken,
      tokens,
      message: "Tokens refreshed successfully",
    });
  } catch (err) {
    console.error("Refresh Token Error:", err);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
}

// LOGOUT User
export async function logout(req, res) {
  try {
    const { refreshToken } = req.body || {};
    if (req.user && refreshToken) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { refreshTokens: refreshToken } });
    }
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    console.error("Logout Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// GET Current Logged-in User
export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let profile = null;
    if (user.role === "CANDIDATE") {
      profile = await CandidateProfile.findOne({ user: user._id });
    }

    return res.status(200).json({
      success: true,
      user,
      profile,
    });
  } catch (err) {
    console.error("GetMe Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}

// CHANGE PASSWORD
export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Both passwords are required",
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 8 characters",
    });
  }

  try {
    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    user.refreshTokens = [];
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully !!",
    });
  } catch (err) {
    console.error("Change Password Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server Error !",
    });
  }
}


