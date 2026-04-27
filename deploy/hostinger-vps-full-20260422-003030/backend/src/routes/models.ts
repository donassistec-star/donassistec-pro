import { Router } from "express";
import PhoneModelController from "../controllers/PhoneModelController";
import { authenticateToken } from "../middleware/auth";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

// Endpoints públicos de leitura
router.get("/", PhoneModelController.getAll);
router.get("/:id", PhoneModelController.getById);
router.get("/brand/:brandId", PhoneModelController.getByBrand);
router.get("/:id/videos", PhoneModelController.getVideos);

// Endpoints de administração (modelos e vídeos) - requerem autenticação E role admin
router.post("/:id/videos", authenticateToken, requireAdmin, PhoneModelController.createVideo);
router.put("/:id/videos/:videoId", authenticateToken, requireAdmin, PhoneModelController.updateVideo);
router.delete("/:id/videos/:videoId", authenticateToken, requireAdmin, PhoneModelController.deleteVideo);
router.post("/", authenticateToken, requireAdmin, PhoneModelController.create);
router.put("/:id", authenticateToken, requireAdmin, PhoneModelController.update);
router.delete("/:id", authenticateToken, requireAdmin, PhoneModelController.delete);

export default router;
