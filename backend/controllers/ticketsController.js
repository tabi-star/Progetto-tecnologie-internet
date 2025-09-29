// controllers/ticketsController.js
import { getAllTickets, insertTicket } from "../models/ticketModel.js";

export const getTickets = (req, res) => {
  getAllTickets((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

export const addTicket = (req, res) => {
  const { screening_id, user_id, seat_number } = req.body;

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
