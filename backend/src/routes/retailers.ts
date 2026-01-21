import { Router } from "express";
import RetailerController from "../controllers/RetailerController";
import { authenticateToken } from "../middleware/auth";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

// Todas as rotas requerem autenticação E role admin
router.get("/", authenticateToken, requireAdmin, RetailerController.getAll);
router.get("/:id", authenticateToken, requireAdmin, RetailerController.getById);
router.put("/:id/status", authenticateToken, requireAdmin, RetailerController.updateStatus);
router.delete("/:id", authenticateToken, requireAdmin, RetailerController.delete);

export default router;
