import { Router } from "express";
import OrderController from "../controllers/OrderController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Pedidos criados pelo checkout (requer autenticação para aplicar cupons)
router.post("/", authenticateToken, OrderController.create);

// Listagem e gestão de pedidos - apenas lojista autenticado
router.get("/", authenticateToken, OrderController.getAll);
router.get("/:id", authenticateToken, OrderController.getById);
router.put("/:id/status", authenticateToken, OrderController.updateStatus);
router.delete("/:id", authenticateToken, OrderController.delete);

export default router;
