import { Router } from "express";
import ProductViewController from "../controllers/ProductViewController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Registrar visualização (pode ser chamado sem autenticação)
router.post("/:modelId", ProductViewController.recordView);

// Obter estatísticas de um modelo
router.get("/stats/:modelId", ProductViewController.getModelStats);

// Obter produtos mais visualizados
router.get("/most-viewed", ProductViewController.getMostViewed);

// Obter histórico do usuário (requer autenticação)
router.get("/history", authenticateToken, ProductViewController.getUserHistory);

export default router;
