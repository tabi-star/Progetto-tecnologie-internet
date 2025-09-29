// ticketModel.js
import db from "../db.js";

export const getAllTickets = (cb) => {
  db.query("SELECT * FROM tickets", cb);
};

export const insertTicket = (ticket, cb) => {
  db.query("INSERT INTO tickets SET ?", ticket, cb);
};
