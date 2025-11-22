import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { get, add, update, remove, clear } from "../controllers/cartController.js";

const router = Router();

router.get("/", requireAuth, get);
router.post("/agregar", requireAuth, add);
router.post("/", requireAuth, add);
router.patch("/items/:id", requireAuth, update);
router.delete("/items/:id", requireAuth, remove);
router.delete("/", requireAuth, clear);

export default router;