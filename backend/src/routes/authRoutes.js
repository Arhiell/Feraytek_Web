import { Router } from "express";
import { register, login, me, schemas } from "../controllers/authController.js";
import { validate } from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.post("/register", validate(schemas.registerSchema), register);
router.post("/login", validate(schemas.loginSchema), login);
router.get("/me", requireAuth, me);

export default router;