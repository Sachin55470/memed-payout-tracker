import { Router } from "express";
import { updateViews } from "@/controllers/submission.controller";
import { validate } from "@/middleware/validate";
import { updateViewsSchema } from "@/validators/submission.validator";

const router = Router();

router.patch("/:id/views", validate(updateViewsSchema), updateViews);

export default router;
