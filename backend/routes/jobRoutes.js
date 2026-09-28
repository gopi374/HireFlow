import express from "express";
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  publishJob,
  closeJob,
} from "../controllers/jobController.js";
import { applyToJob, getJobApplications } from "../controllers/applicationController.js";
import { protect, optionalAuth } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";

const router = express.Router();

// Public or Recruiter job search & details
router.get("/", optionalAuth, getJobs);
router.get("/:jobId", optionalAuth, getJobById);

// Recruiter job creation & management
router.post("/", protect, authorize("RECRUITER", "ADMIN"), createJob);
router.patch("/:jobId", protect, authorize("RECRUITER", "ADMIN"), updateJob);
router.delete("/:jobId", protect, authorize("RECRUITER", "ADMIN"), deleteJob);
router.post("/:jobId/publish", protect, authorize("RECRUITER", "ADMIN"), publishJob);
router.post("/:jobId/close", protect, authorize("RECRUITER", "ADMIN"), closeJob);

// Candidate apply for job
router.post("/:jobId/apply", protect, authorize("CANDIDATE"), applyToJob);

// Recruiter view applications for a job
router.get("/:jobId/applications", protect, authorize("RECRUITER", "ADMIN"), getJobApplications);

export default router;
