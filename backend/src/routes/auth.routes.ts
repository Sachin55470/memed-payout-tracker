import { Router } from "express";
import { getMe, login, logout, refresh, signup } from "@/controllers/auth.controller";
import { protect } from "@/middleware/auth";
import { validate } from "@/middleware/validate";
import { loginSchema, signupSchema } from "@/validators/auth.validator";

const router = Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;
