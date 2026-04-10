import { Router } from "express";
import RetailerPriceTableController from "../controllers/RetailerPriceTableController";
import { authenticateToken } from "../middleware/auth";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

router.get("/admin", authenticateToken, requireAdmin, RetailerPriceTableController.getAdminList);
router.post("/admin/reorder", authenticateToken, requireAdmin, RetailerPriceTableController.reorder);

// History & Versioning routes
router.get("/admin/:slug/history", authenticateToken, requireAdmin, RetailerPriceTableController.getHistory);
router.get("/admin/:slug/history/:version", authenticateToken, requireAdmin, RetailerPriceTableController.getHistoryVersion);
router.post("/admin/:slug/rollback/:version", authenticateToken, requireAdmin, RetailerPriceTableController.rollbackToVersion);
router.get("/admin/:slug/diff", authenticateToken, requireAdmin, RetailerPriceTableController.getVersionComparison);

// Price History & Analytics routes
router.get("/admin/:slug/price-history", authenticateToken, requireAdmin, RetailerPriceTableController.getPriceHistory);
router.get("/admin/:slug/price-history/:serviceKey", authenticateToken, requireAdmin, RetailerPriceTableController.getPriceTrend);
router.get("/admin/:slug/analytics/stats", authenticateToken, requireAdmin, RetailerPriceTableController.getPriceStats);
router.get("/admin/:slug/analytics/daily", authenticateToken, requireAdmin, RetailerPriceTableController.getDailyReport);
router.get("/admin/:slug/analytics/volatile", authenticateToken, requireAdmin, RetailerPriceTableController.getVolatileServices);
router.get("/admin/:slug/analytics/increases", authenticateToken, requireAdmin, RetailerPriceTableController.getTopIncreases);
router.get("/admin/:slug/analytics/decreases", authenticateToken, requireAdmin, RetailerPriceTableController.getTopDecreases);

// Main admin routes
router.get("/admin/:slug", authenticateToken, requireAdmin, RetailerPriceTableController.getAdminBySlug);
router.put("/admin/:slug", authenticateToken, requireAdmin, RetailerPriceTableController.upsert);
router.delete("/admin/:slug", authenticateToken, requireAdmin, RetailerPriceTableController.delete);

router.get("/retailer", authenticateToken, RetailerPriceTableController.getRetailerList);
router.get("/retailer/:slug", authenticateToken, RetailerPriceTableController.getRetailerActive);

export default router;
