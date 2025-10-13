// routes/screenings.js
import { Router } from "express";
import { getScreenings, getScreening, getScreeningsByMovieAndDate, addScreening, modifyScreening, removeScreening, checkScreeningOverlap } from "../controllers/screeningsController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { validateScreening } from "../middleware/validation.js";

const router = Router();

router.get("/", getScreenings);
router.get("/movie/:movie_id/date/:date", getScreeningsByMovieAndDate);
router.get("/:id", getScreening);
router.post("/", authenticateToken, requireAdmin, validateScreening, addScreening);
router.post("/check-overlap", authenticateToken, requireAdmin, checkScreeningOverlap);
router.put("/:id", authenticateToken, requireAdmin, validateScreening, modifyScreening);
router.delete("/:id", authenticateToken, requireAdmin, removeScreening);

export default router;