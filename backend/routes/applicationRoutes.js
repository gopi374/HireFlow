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

router.use(protect);

router.get("/:applicationId", getApplicationById);
router.patch("/:applicationId/status", authorize("RECRUITER", "ADMIN"), updateApplicationStatus);
router.post("/:applicationId/notes", authorize("RECRUITER", "ADMIN"), addRecruiterNote);
router.post("/:applicationId/withdraw", authorize("CANDIDATE"), withdrawApplication);

export default router;
