import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { list, detail, create, update, remove, activeCategories, categoryDetail, categoryStats } from "../controllers/productsController.js";

const router = Router();

router.get("/productos", list);
router.get("/productos/:id", detail);
router.post("/productos", requireAuth, create);
router.put("/productos/:id", requireAuth, update);
router.delete("/productos/:id", requireAuth, remove);

router.get("/categorias/activas", activeCategories);
router.get("/categorias/:id", categoryDetail);
router.get("/categorias/stats", categoryStats);

export default router;