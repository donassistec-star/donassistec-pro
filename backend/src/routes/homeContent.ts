import { Router } from "express";
import HomeContentController from "../controllers/HomeContentController";
import { authenticateToken } from "../middleware/auth";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

// Leitura pública do conteúdo da home
router.get("/", HomeContentController.get);

// Atualização do conteúdo da home - apenas admin
router.put("/", authenticateToken, requireAdmin, HomeContentController.update);

export default router;
