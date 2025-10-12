// routes/halls.js
import { Router } from "express";
import { getHalls, getHall, addHall, modifyHall, removeHall } from "../controllers/hallsController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { generateSeatsForHall } from "../controllers/hallsController.js";
const router = Router();

router.get("/", getHalls);
router.get("/:id", getHall);
router.post("/", authenticateToken, requireAdmin, addHall);
router.put("/:id", authenticateToken, requireAdmin, modifyHall);
router.delete("/:id", authenticateToken, requireAdmin, removeHall);
router.post("/:id/generate-seats", authenticateToken, requireAdmin, generateSeatsForHall);

export default router;