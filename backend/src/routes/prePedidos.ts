import { Router } from "express";
import PrePedidoController from "../controllers/PrePedidoController";
import { authenticateToken } from "../middleware/auth";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

router.get("/", authenticateToken, requireAdmin, PrePedidoController.getAll);
router.post("/", PrePedidoController.create);

export default router;
