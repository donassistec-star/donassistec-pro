import { Router } from "express";
import PrePedidoController from "../controllers/PrePedidoController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.get("/", authenticateToken, PrePedidoController.getAll);
router.get("/:id", authenticateToken, PrePedidoController.getById);
router.post("/", PrePedidoController.create);

export default router;
