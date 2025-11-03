// routes/statsRoutes.js

import { Router } from "express";
import { 
  getDashboardStats, 
  getDetailedDashboardStats 
} from "../controllers/statsController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = Router();

// Route per statistiche dashboard admin
router.get("/dashboard", authenticateToken, requireAdmin, getDashboardStats);

// Route per statistiche dettagliate (opzionale)
router.get("/dashboard/detailed", authenticateToken, requireAdmin, getDetailedDashboardStats);

export default router;