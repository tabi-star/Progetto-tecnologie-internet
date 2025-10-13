// controllers/ticketsController.js
import { getAllTickets, getTicketsByUser, reserveSeats, confirmTickets, cancelTicket, insertTicket } from "../models/ticketModel.js";
import { generateQRCode } from "../services/qrCodeService.js";
import { sendConfirmationEmail } from "../services/emailService.js";

export const getTickets = (req, res) => {
  getAllTickets((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

export const getUserTickets = async (req, res) => {
  try {
    const tickets = await getTicketsByUser(req.user.id);
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const reserveTicketSeats = async (req, res) => {
  try {
    const { screening_id, seat_numbers } = req.body;
    const user_id = req.user.id;

    if (!screening_id || !seat_numbers || !Array.isArray(seat_numbers)) {
      return res.status(400).json({ error: "Screening ID e lista posti sono obbligatori" });
    }

    const result = await reserveSeats(screening_id, seat_numbers, user_id);
    
    res.json({
      message: "Posti riservati temporaneamente",
      ...result
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const confirmTicketPayment = async (req, res) => {
  try {
    const { ticket_ids, discount_id } = req.body;
    const user_id = req.user.id;

    if (!ticket_ids || !Array.isArray(ticket_ids)) {
      return res.status(400).json({ error: "Lista ticket IDs è obbligatoria" });
    }

    // Genera QR Code
    const qr_code_url = await generateQRCode(ticket_ids);

    const payment_data = {
      payment_id: `pay_${Date.now()}`,
      qr_code_url
    };

    const tickets = await confirmTickets(ticket_ids, payment_data);
    
    // Applica sconto se presente
    if (discount_id) {
      // Qui puoi integrare la logica per applicare lo sconto
      console.log(`Sconto applicato: ${discount_id}`);
    }

    // Invia email di conferma
    await sendConfirmationEmail(req.user.email, tickets, qr_code_url);

    res.json({
      message: "Pagamento confermato e biglietti emessi",
      tickets,
      qr_code_url
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const cancelUserTicket = async (req, res) => {
  try {
    const { ticket_id } = req.params;
    const user_id = req.user.id;

    await cancelTicket(ticket_id, user_id);
    
    res.json({ message: "Prenotazione cancellata con successo" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const addTicket = (req, res) => {
  const { screening_id, seat_number } = req.body;
  const user_id = req.user.id;

  const newTicket = {
    screening_id,
    user_id,
    seat_number,
    bookedAt: new Date()
  };

  insertTicket(newTicket, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    newTicket.id = result.insertId;
    res.status(201).json({ message: "Biglietto prenotato con successo", ticket: newTicket });
  });
};