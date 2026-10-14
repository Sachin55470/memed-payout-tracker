import { Router } from "express";
import { createCampaign, getCampaignSubmissions, getMyCampaigns } from "@/controllers/campaign.controller";
import { allowRoles, protect } from "@/middleware/auth";
import { validate } from "@/middleware/validate";
import { createCampaignSchema } from "@/validators/campaign.validator";

const router = Router();

router.use(protect, allowRoles("brand"));

router.post("/campaigns", validate(createCampaignSchema), createCampaign);
router.get("/campaigns", getMyCampaigns);
router.get("/campaigns/:id/submissions", getCampaignSubmissions);

export default router;
