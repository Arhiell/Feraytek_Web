import { Router } from "express";
import { register, login, me, schemas } from "../controllers/authController.js";
import { validate } from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.post("/register", validate(schemas.registerSchema), register);
router.post("/login", validate(schemas.loginSchema), login);
router.get("/me", requireAuth, me);

// Compatibilidad con rutas documentadas en /users/*
router.post("/users/register", validate(schemas.registerSchema), register);
router.post("/users/login", validate(schemas.loginSchema), login);
router.get("/users/profile", requireAuth, me);

export default router;