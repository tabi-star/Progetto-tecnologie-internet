// routes/halls.js
import { Router } from "express";
import { getHalls, addHall } from "../controllers/hallsController.js";

const router = Router();

router.get("/", getHalls);
router.post("/", addHall);

export default router;
