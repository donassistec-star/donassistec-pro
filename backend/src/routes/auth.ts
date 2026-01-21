import { Router } from "express";
import AuthController from "../controllers/AuthController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/me", authenticateToken, AuthController.me);
router.put("/profile", authenticateToken, AuthController.updateProfile);
router.put("/password", authenticateToken, AuthController.changePassword);

export default router;
