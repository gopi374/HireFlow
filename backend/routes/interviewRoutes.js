import express from "express";
import {
  scheduleInterview,
  getInterviews,
  getInterviewById,
  updateInterview,
  cancelInterview,
  evaluateInterview,
} from "../controllers/interviewController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";

const router = express.Router();

// Require login for interview routes
router.use(protect);

// View interviews
router.get("/", getInterviews);
router.get("/:interviewId", getInterviewById);

// Recruiter & Admin interview actions
router.post("/", authorize("RECRUITER", "ADMIN"), scheduleInterview);
router.patch("/:interviewId", authorize("RECRUITER", "ADMIN"), updateInterview);
router.post("/:interviewId/cancel", authorize("RECRUITER", "ADMIN"), cancelInterview);
router.post("/:interviewId/evaluation", authorize("RECRUITER", "ADMIN"), evaluateInterview);

export default router;
