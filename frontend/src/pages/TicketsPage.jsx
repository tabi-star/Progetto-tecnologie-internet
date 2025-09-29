// src/pages/TicketsPage.jsx

import { useEffect, useState } from "react";
import { getTickets, addTicket } from "../api/tickets";

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ screening_id: "", user_id: "", seat_number: "" });

  useEffect(() => {
    getTickets().then(setTickets);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newTicket = await addTicket(form);
    setTickets([...tickets, newTicket.ticket]);
  };

  return (
    <div>
      <h1>🎟️ Tickets</h1>
      <ul>
        {tickets.map((t) => (
          <li key={t.id}>
            Seat {t.seat_number} for Screening {t.screening_id} by User {t.user_id}
          </li>
        ))}
      </ul>

      <h2>Add Ticket</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Screening ID" onChange={(e) => setForm({ ...form, screening_id: e.target.value })} />
        <input placeholder="User ID" onChange={(e) => setForm({ ...form, user_id: e.target.value })} />
        <input placeholder="Seat Number" onChange={(e) => setForm({ ...form, seat_number: e.target.value })} />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}
