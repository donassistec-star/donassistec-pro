import { Router } from "express";
import AuditLogController from "../controllers/AuditLogController";
import { authenticateToken } from "../middleware/auth";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

// Todas as rotas requerem autenticação e permissão de admin
router.get("/", authenticateToken, requireAdmin, AuditLogController.getAll);
router.get("/:id", authenticateToken, requireAdmin, AuditLogController.getById);

export default router;
