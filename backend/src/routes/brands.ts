import { Router } from "express";
import BrandController from "../controllers/BrandController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Endpoints públicos de leitura
router.get("/", BrandController.getAll);
router.get("/:id", BrandController.getById);

// Endpoints de administração de marcas - requerem autenticação E role admin
import { requireAdmin } from "../middleware/requireAdmin";

router.post("/", authenticateToken, requireAdmin, BrandController.create);
router.put("/:id", authenticateToken, requireAdmin, BrandController.update);
router.delete("/:id", authenticateToken, requireAdmin, BrandController.delete);

export default router;
