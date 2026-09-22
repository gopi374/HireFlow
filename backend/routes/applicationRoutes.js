import express from "express";
import {
  getApplicationById,
  updateApplicationStatus,
  addRecruiterNote,
  withdrawApplication,
} from "../controllers/applicationController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";

const router = express.Router();

// Require login for application operations
router.use(protect);

// View application details
router.get("/:applicationId", getApplicationById);

// Recruiter updates
router.patch("/:applicationId/status", authorize("RECRUITER", "ADMIN"), updateApplicationStatus);
router.post("/:applicationId/notes", authorize("RECRUITER", "ADMIN"), addRecruiterNote);

// Candidate withdraw
router.post("/:applicationId/withdraw", authorize("CANDIDATE"), withdrawApplication);

export default router;
