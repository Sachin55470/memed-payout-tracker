import { Router } from "express";
import authRoutes from "./auth.routes";
import brandRoutes from "./brand.routes";
import campaignRoutes from "./campaign.routes";
import creatorRoutes from "./creator.routes";
import submissionRoutes from "./submission.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/brand", brandRoutes);
router.use("/creator", creatorRoutes);
router.use("/campaigns", campaignRoutes);
router.use("/submissions", submissionRoutes);

export default router;
