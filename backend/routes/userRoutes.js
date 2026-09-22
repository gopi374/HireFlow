import express from "express";
import {
  updateMe,
  updateCandidateProfile,
  uploadResume,
  toggleSaveJob,
  getMyApplications,
  getMyInterviews,
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.use(protect);

router.patch("/me", updateMe);
router.patch("/me/candidate-profile", authorize("CANDIDATE"), updateCandidateProfile);
router.post("/me/resume", authorize("CANDIDATE"), upload.single("resume"), uploadResume);
router.post("/jobs/:jobId/save", authorize("CANDIDATE"), toggleSaveJob);
router.get("/me/applications", authorize("CANDIDATE"), getMyApplications);
router.get("/me/interviews", authorize("CANDIDATE"), getMyInterviews);

export default router;
