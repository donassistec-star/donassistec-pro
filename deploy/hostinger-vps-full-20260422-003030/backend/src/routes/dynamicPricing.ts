import { Router } from "express";
import DynamicPricingController from "../controllers/DynamicPricingController";
import { authenticateToken } from "../middleware/auth";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

// Rotas públicas (para buscar preços por modelo e quantidade)
router.get("/model/:modelId", DynamicPricingController.getByModel);
router.get("/model/:modelId/price", DynamicPricingController.getPrice);

// Rotas administrativas (requerem autenticação e admin)
router.post("/", authenticateToken, requireAdmin, DynamicPricingController.create);
router.put("/:id", authenticateToken, requireAdmin, DynamicPricingController.update);
router.delete("/:id", authenticateToken, requireAdmin, DynamicPricingController.delete);

export default router;
