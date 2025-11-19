// controllers/ticketsController.js
import { 
  getAllTickets, 
  getTicketsByUser, 
  reserveSeats, 
  confirmTickets, 
  cancelTicket, 
  insertTicket 
} from "../models/ticketModel.js";
import { generateQRCode } from "../services/qrCodeService.js";

export const getTickets = async (req, res) => {
  try {
    const tickets = await getAllTickets();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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
    const { screening_id, seat_numbers, discountApplied } = req.body;
    const user_id = req.user.id;

    // ✅ Validazione input migliorata
    if (!screening_id) {
      return res.status(400).json({ error: "Screening ID obbligatorio" });
    }

    if (!seat_numbers || !Array.isArray(seat_numbers) || seat_numbers.length === 0) {
      return res.status(400).json({ error: "Lista posti obbligatoria e non vuota" });
    }

    // Validazione screening_id
    const screeningId = parseInt(screening_id);
    if (!screeningId || screeningId <= 0) {
      return res.status(400).json({ error: "Screening ID non valido" });
    }

    const result = await reserveSeats(screeningId, seat_numbers, user_id, discountApplied);
    
    res.json({
      message: "Posti riservati temporaneamente",
      ...result
    });
  } catch (error) {
    console.error('❌ Errore prenotazione posti:', error);
    res.status(400).json({ error: error.message });
  }
};

export const confirmTicketPayment = async (req, res) => {
  try {
    const { ticket_ids, discount_id, payment_order_id } = req.body;
    const user_id = req.user.id;

    // ✅ Validazione input migliorata
    if (!ticket_ids || !Array.isArray(ticket_ids) || ticket_ids.length === 0) {
      return res.status(400).json({ error: "Lista ticket IDs obbligatoria e non vuota" });
    }

    // Validazione ticket_ids
    const validTicketIds = ticket_ids.map(id => parseInt(id)).filter(id => id > 0);
    if (validTicketIds.length !== ticket_ids.length) {
      return res.status(400).json({ error: "Formato ticket IDs non valido" });
    }

    // ✅ GENERA IL QR CODE PRIMA
    const qr_code_url = await generateQRCode(validTicketIds);

    const payment_data = {
      payment_id: `pay_${Date.now()}`,
      qr_code_url,
      payment_order_id,
      user_id,
      discount_id: discount_id ? parseInt(discount_id) : null
    };

    // ✅ CONFERMA I TICKET (questo gestirà anche l'email)
    const tickets = await confirmTickets(validTicketIds, payment_data);

    res.json({
      message: "Pagamento confermato e biglietti emessi",
      tickets,
      qr_code_url
    });
  } catch (error) {
    console.error('❌ Errore conferma pagamento:', error);
    res.status(400).json({ error: error.message });
  }
};

export const cancelUserTicket = async (req, res) => {
  try {
    const { ticket_id } = req.params;
    const user_id = req.user.id;

    // ✅ Validazione input
    const ticketId = parseInt(ticket_id);
    if (!ticketId || ticketId <= 0) {
      return res.status(400).json({ error: "Ticket ID non valido" });
    }

    await cancelTicket(ticketId, user_id);
    
    res.json({ message: "Prenotazione cancellata con successo" });
  } catch (error) {
    console.error('❌ Errore cancellazione ticket:', error);
    res.status(400).json({ error: error.message });
  }
};

export const addTicket = async (req, res) => {
  try {
    const { screening_id, seat_number } = req.body;
    const user_id = req.user.id;

    // ✅ Validazione input
    if (!screening_id || !seat_number) {
      return res.status(400).json({ error: "Screening ID e numero posto obbligatori" });
    }

    const screeningId = parseInt(screening_id);
    if (!screeningId || screeningId <= 0) {
      return res.status(400).json({ error: "Screening ID non valido" });
    }

    const newTicket = {
      screening_id: screeningId,
      user_id,
      seat_number,
      bookedAt: new Date()
    };

    const result = await insertTicket(newTicket);
    newTicket.id = result.insertId;
    
    res.status(201).json({ 
      message: "Biglietto prenotato con successo", 
      ticket: newTicket 
    });
  } catch (error) {
    console.error('❌ Errore aggiunta biglietto:', error);
    res.status(500).json({ error: error.message });
  }
};