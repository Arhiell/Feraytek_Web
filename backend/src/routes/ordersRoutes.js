import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { create, history, order } from "../controllers/ordersController.js";

const router = Router();

router.post("/pedidos", requireAuth, create);
router.get("/historial_pedidos", requireAuth, history);
router.get("/historial_pedidos/pedido/:id", requireAuth, order);
router.get("/pedidos/:id", requireAuth, order);

export default router;