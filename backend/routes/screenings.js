// routes/screenings.js
import { Router } from "express";
import { getScreenings, addScreening } from "../controllers/screeningsController.js";

const router = Router();

router.get("/", getScreenings);
router.post("/", addScreening);

export default router;
