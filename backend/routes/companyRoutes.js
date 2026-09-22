import express from "express";
import {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  requestVerification,
} from "../controllers/companyController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";

const router = express.Router();

router.get("/", getCompanies);
router.get("/:companyId", getCompanyById);

router.post("/", protect, authorize("RECRUITER", "ADMIN"), createCompany);
router.patch("/:companyId", protect, authorize("RECRUITER", "ADMIN"), updateCompany);
router.post("/:companyId/verification", protect, authorize("RECRUITER", "ADMIN"), requestVerification);

export default router;
