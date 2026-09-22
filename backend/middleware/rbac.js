import { sendError } from "../utils/response.js";

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access forbidden. Required role(s): ${roles.join(", ")}. Your role: ${req.user?.role || "ANONYMOUS"}`,
        403,
        "FORBIDDEN_ROLE"
      );
    }
    next();
  };
};

// Resource ownership check utility helper
export const checkOwnership = (resourceUserId, currentUserId, currentUserRole) => {
  if (currentUserRole === "ADMIN") return true;
  return resourceUserId.toString() === currentUserId.toString();
};
