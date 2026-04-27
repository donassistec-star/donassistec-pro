import { Router } from "express";
import CouponController from "../controllers/CouponController";
import { authenticateToken } from "../middleware/auth";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

// Validar cupom (público para lojistas autenticados)
router.post("/validate", authenticateToken, CouponController.validate);

// Histórico de uso por lojista
router.get("/usage", authenticateToken, CouponController.getUsageByRetailer);

// CRUD de cupons (apenas admin)
router.get("/", requireAdmin, CouponController.getAll);
router.get("/:id", requireAdmin, CouponController.getById);
router.post("/", requireAdmin, CouponController.create);
router.put("/:id", requireAdmin, CouponController.update);
router.delete("/:id", requireAdmin, CouponController.delete);

export default router;
