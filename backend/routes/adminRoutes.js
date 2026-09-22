import express from "express";
import {
  getPlatformStats,
  listUsers,
  updateUserStatus,
  verifyCompany,
  getAuditLogs,
} from "../controllers/adminController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";

const router = express.Router();

router.use(protect, authorize("ADMIN"));

router.get("/stats", getPlatformStats);
router.get("/users", listUsers);
router.patch("/users/:userId/status", updateUserStatus);
router.patch("/companies/:companyId/verification", verifyCompany);
router.get("/audit-logs", getAuditLogs);

export default router;
