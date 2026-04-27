import { Router } from "express";
import ReviewController from "../controllers/ReviewController";
import { authenticateToken } from "../middleware/auth";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

// Rotas públicas (para buscar avaliações)
router.get("/model/:modelId", ReviewController.getByModel);

// Rotas autenticadas (para criar/editar avaliações)
router.post("/", authenticateToken, ReviewController.create);
router.put("/:id", authenticateToken, ReviewController.update);

// Rotas administrativas (para aprovar/excluir)
router.put("/:id/approve", authenticateToken, requireAdmin, ReviewController.approve);
router.delete("/:id", authenticateToken, requireAdmin, ReviewController.delete);

export default router;
