// src/pages/HallsPage.jsx

import { useEffect, useState } from "react";
import { getHalls, addHall } from "../api/halls";

export default function HallsPage() {
  const [halls, setHalls] = useState([]);
  const [form, setForm] = useState({ name: "", hall_type: "Standard", capacity: "" });

  useEffect(() => {
    getHalls().then(setHalls);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newHall = await addHall(form);
    setHalls([...halls, newHall.hall]);
  };

  return (
    <div>
      <h1>🏟️ Halls</h1>
      <ul>
        {halls.map((h) => (
          <li key={h.id}>
            {h.name} - {h.hall_type} ({h.capacity} posti)
          </li>
        ))}
      </ul>

      <h2>Add Hall</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <select onChange={(e) => setForm({ ...form, hall_type: e.target.value })}>
          <option value="Standard">Standard</option>
          <option value="Imax">Imax</option>
        </select>
        <input placeholder="Capacity" type="number" onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}
