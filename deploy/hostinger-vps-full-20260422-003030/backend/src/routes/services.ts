import { Router } from "express";
import ServiceController from "../controllers/ServiceController";
import { authenticateToken } from "../middleware/auth";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

// CRUD de serviços (apenas admin)
router.get("/", ServiceController.getAll);
router.get("/:id", ServiceController.getById);
router.post("/", authenticateToken, requireAdmin, ServiceController.create);
router.put("/:id", authenticateToken, requireAdmin, ServiceController.update);
router.delete("/:id", authenticateToken, requireAdmin, ServiceController.delete);

// Serviços por modelo (preços)
router.get("/model/:modelId", ServiceController.getModelServices);
router.post("/model/:modelId/:serviceId", authenticateToken, requireAdmin, ServiceController.setModelService);
router.delete("/model/:modelId/:serviceId", authenticateToken, requireAdmin, ServiceController.removeModelService);

export default router;
