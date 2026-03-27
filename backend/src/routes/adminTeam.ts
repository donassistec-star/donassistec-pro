import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { requireAdminTeamAdmin } from "../middleware/requireAdmin";
import AdminTeamController from "../controllers/AdminTeamController";

const router = Router();

router.use(authenticateToken, requireAdminTeamAdmin);

router.get("/", AdminTeamController.getAll);
router.get("/modules", AdminTeamController.getModules);
router.get("/modules/default-for-role/:role", AdminTeamController.getDefaultModulesForRole);
router.get("/:id", AdminTeamController.getById);
router.get("/:id/module-permissions", AdminTeamController.getModulePermissions);

router.post("/", AdminTeamController.create);
router.post("/:id/duplicate", AdminTeamController.duplicate);

router.put("/:id", AdminTeamController.update);
router.put("/:id/status", AdminTeamController.updateStatus);
router.put("/:id/password", AdminTeamController.setPassword);
router.put("/:id/module-overrides", AdminTeamController.setModuleOverrides);

router.delete("/:id", AdminTeamController.delete);

export default router;
