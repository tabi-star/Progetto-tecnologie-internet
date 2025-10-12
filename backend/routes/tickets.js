// routes/tickets.js
import { Router } from "express";
import { getTickets, addTicket, getUserTickets, reserveTicketSeats, confirmTicketPayment, cancelUserTicket } from "../controllers/ticketsController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticateToken, getTickets);
router.post("/", authenticateToken, addTicket);
router.get("/my-tickets", authenticateToken, getUserTickets);
router.post("/reserve", authenticateToken, reserveTicketSeats);
router.post("/confirm-payment", authenticateToken, confirmTicketPayment);
router.delete("/:ticket_id/cancel", authenticateToken, cancelUserTicket);

export default router;