// routes/seats.js
import { Router } from "express";
import { getHallSeats, getScreeningSeats } from "../controllers/seatsController.js";

const router = Router();

router.get("/hall/:hall_id", getHallSeats);
router.get("/screening/:screening_id", getScreeningSeats);

export default router;