import { Router } from "express";
import { getMySubmissions } from "../controllers/submission.controller";
import { allowRoles, protect } from "../middleware/auth";

const router = Router();

router.use(protect, allowRoles("creator"));

router.get("/submissions", getMySubmissions);

export default router;
