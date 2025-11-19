// routes/statsRoutes.js

import { Router } from "express";
import { 
  getDashboardStats 
} from "../controllers/statsController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = Router();

// Route per statistiche dashboard admin
router.get("/dashboard", authenticateToken, requireAdmin, getDashboardStats);

export default router;