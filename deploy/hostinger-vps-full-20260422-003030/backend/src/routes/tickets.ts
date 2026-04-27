import { Router } from "express";
import TicketController from "../controllers/TicketController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Todas as rotas requerem autenticação
router.get("/", authenticateToken, TicketController.getAll);
router.get("/:id", authenticateToken, TicketController.getById);
router.post("/", authenticateToken, TicketController.create);
router.post("/:id/messages", authenticateToken, TicketController.addMessage);
router.put("/:id", authenticateToken, TicketController.update);

export default router;
