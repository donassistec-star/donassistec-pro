import { Router } from "express";
import OrderController from "../controllers/OrderController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Pedidos criados pelo checkout (requer autenticação para aplicar cupons)
router.post("/", OrderController.create);

// Converter pré-pedido em pedido (admin ou lojista dono do pré-pedido)
router.post("/from-pre-pedido", authenticateToken, OrderController.createFromPrePedido);

// Listagem e gestão de pedidos
router.get("/", authenticateToken, OrderController.getAll);
router.get("/:id", authenticateToken, OrderController.getById);
router.put("/:id/status", authenticateToken, OrderController.updateStatus);
router.delete("/:id", authenticateToken, OrderController.delete);

export default router;
