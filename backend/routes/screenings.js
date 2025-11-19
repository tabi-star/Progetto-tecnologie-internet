// routes/screenings.js
import { Router } from "express";
import { getScreenings, getScreening, getScreeningsByMovieAndDate, addScreening, modifyScreening, removeScreening, checkScreeningOverlap, getScreeningsCountToday } from "../controllers/screeningsController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { validateScreening } from "../middleware/validation.js";

const router = Router();

router.get("/", getScreenings);
router.post("/", authenticateToken, requireAdmin, validateScreening, addScreening);
router.get("/movie/:movie_id/date/:date", getScreeningsByMovieAndDate);
router.post("/check-overlap", authenticateToken, requireAdmin, checkScreeningOverlap);
router.get("/:id", getScreening);
router.put("/:id", authenticateToken, requireAdmin, validateScreening, modifyScreening);
router.delete("/:id", authenticateToken, requireAdmin, removeScreening);
router.get("/count/:hall_id", getScreeningsCountToday);

export default router;