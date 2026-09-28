import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to verify JWT token and protect private routes
export async function protect(req, res, next) {
  let token;

  // Check authorization header or cookie
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access Denied: No token provided!",
    });
  }

  try {
    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "default_jwt_secret";
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id || decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or token is invalid",
      });
    }

    if (user.status === "SUSPENDED") {
      return res.status(403).json({
        success: false,
        message: "Your account is suspended. Please contact support.",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token!",
    });
  }
}

// Optional Auth Middleware - populates req.user if token is present without blocking if missing
export async function optionalAuth(req, res, next) {
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next();
  }

  try {
    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "default_jwt_secret";
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id || decoded.userId);
    if (user && user.status !== "SUSPENDED") {
      req.user = user;
    }
  } catch (err) {
    // Silently continue for optional auth
  }
  next();
}

