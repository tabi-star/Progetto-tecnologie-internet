// routes/tickets.js
import { Router } from "express";
import { getTickets, addTicket } from "../controllers/ticketsController.js";

const router = Router();

router.get("/", getTickets);
router.post("/", addTicket);

export default router;
