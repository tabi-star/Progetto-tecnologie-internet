import { Router } from "express";
import { getHallSeats, getScreeningSeats } from "../controllers/seatsController.js";
import { optionalAuth } from "../middleware/auth.js"; 

const router = Router();

router.get("/hall/:hall_id", getHallSeats);
router.get("/screening/:screening_id", optionalAuth, getScreeningSeats);

export default router;