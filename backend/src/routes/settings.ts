import { Router } from "express";
import SettingsController from "../controllers/SettingsController";
import { authenticateToken } from "../middleware/auth";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

// Rotas de configurações - requerem autenticação E role admin
router.get("/", authenticateToken, requireAdmin, SettingsController.getAll);
router.put("/", authenticateToken, requireAdmin, SettingsController.update);
router.get("/history", authenticateToken, requireAdmin, SettingsController.getHistory);

export default router;
