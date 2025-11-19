// routes/tickets.js - VERSIONE MIGLIORATA (opzionale)
import { Router } from "express";
import { 
  getTickets, 
  addTicket, 
  getUserTickets, 
  reserveTicketSeats, 
  confirmTicketPayment, 
  cancelUserTicket 
} from "../controllers/ticketsController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticateToken, requireAdmin, getTickets); // ✅ Solo admin
router.post("/", authenticateToken, requireAdmin, addTicket); // ✅ Solo admin
router.get("/my-tickets", authenticateToken, getUserTickets);
router.post("/reserve", authenticateToken, reserveTicketSeats);
router.post("/confirm-payment", authenticateToken, confirmTicketPayment);
router.delete("/:ticket_id/cancel", authenticateToken, cancelUserTicket);

export default router;