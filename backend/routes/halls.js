import { Router } from "express";
import { 
  getHalls, 
  getHall, 
  addHall, 
  modifyHall, 
  removeHall, 
  generateSeatsForHall 
} from "../controllers/hallsController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", getHalls);
router.post("/", authenticateToken, requireAdmin, addHall);
router.get("/:id", getHall);
router.put("/:id", authenticateToken, requireAdmin, modifyHall);
router.delete("/:id", authenticateToken, requireAdmin, removeHall);
router.post("/:id/generate-seats", authenticateToken, requireAdmin, generateSeatsForHall);

export default router;