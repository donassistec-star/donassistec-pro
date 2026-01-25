import { Router } from "express";
import SettingsController from "../controllers/SettingsController";
import { authenticateToken } from "../middleware/auth";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

// Público: configurações para Header, Footer, etc. (sem auth)
router.get("/public", SettingsController.getPublic);

// Rotas de configurações - requerem autenticação E role admin
router.get("/", authenticateToken, requireAdmin, SettingsController.getAll);
router.put("/", authenticateToken, requireAdmin, SettingsController.update);
router.get("/history", authenticateToken, requireAdmin, SettingsController.getHistory);

export default router;
