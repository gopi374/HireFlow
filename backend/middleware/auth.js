import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendError } from "../utils/response.js";

export const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return sendError(res, "Authentication required. Please provide a valid token.", 401, "UNAUTHORIZED");
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "default_access_secret");
    const user = await User.findById(decoded.id || decoded.userId);

    if (!user) {
      return sendError(res, "The user belonging to this token no longer exists.", 401, "USER_NOT_FOUND");
    }

    if (user.status === "SUSPENDED") {
      return sendError(res, "Your account has been suspended. Please contact support.", 403, "ACCOUNT_SUSPENDED");
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, "Invalid or expired authentication token.", 401, "INVALID_TOKEN");
  }
};
