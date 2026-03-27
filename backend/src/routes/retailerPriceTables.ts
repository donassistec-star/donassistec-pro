import { Router } from "express";
import RetailerPriceTableController from "../controllers/RetailerPriceTableController";
import { authenticateToken } from "../middleware/auth";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

router.get("/admin", authenticateToken, requireAdmin, RetailerPriceTableController.getAdminList);
router.post("/admin/reorder", authenticateToken, requireAdmin, RetailerPriceTableController.reorder);
router.get("/admin/:slug", authenticateToken, requireAdmin, RetailerPriceTableController.getAdminBySlug);
router.put("/admin/:slug", authenticateToken, requireAdmin, RetailerPriceTableController.upsert);
router.delete("/admin/:slug", authenticateToken, requireAdmin, RetailerPriceTableController.delete);
router.get("/retailer", authenticateToken, RetailerPriceTableController.getRetailerList);
router.get("/retailer/:slug", authenticateToken, RetailerPriceTableController.getRetailerActive);

export default router;
