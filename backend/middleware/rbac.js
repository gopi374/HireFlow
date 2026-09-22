// Role-based Access Control (RBAC) middleware
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires role [${roles.join(", ")}]. Your role is ${req.user?.role || "GUEST"}`,
      });
    }
    next();
  };
}

// Check if user owns the given resource or is admin
export function checkOwnership(resourceUserId, currentUserId, currentUserRole) {
  if (currentUserRole === "ADMIN") return true;
  return resourceUserId?.toString() === currentUserId?.toString();
}
