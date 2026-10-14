import { Router } from "express";
import { getLiveCampaigns } from "../controllers/campaign.controller";
import { createSubmission } from "../controllers/submission.controller";
import { allowRoles, protect } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createSubmissionSchema } from "../validators/submission.validator";

const router = Router();

router.use(protect);

router.get("/", getLiveCampaigns);
router.post("/:id/submissions", allowRoles("creator"), validate(createSubmissionSchema), createSubmission);

export default router;
