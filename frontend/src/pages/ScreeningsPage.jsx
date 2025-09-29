// src/pages/ScreeningsPage.jsx

import { useEffect, useState } from "react";
import { getScreenings, addScreening } from "../api/screenings";

export default function ScreeningsPage() {
  const [screenings, setScreenings] = useState([]);
  const [form, setForm] = useState({ movie_id: "", hall_id: "", start_time: "" });

  useEffect(() => {
    getScreenings().then(setScreenings);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newScreening = await addScreening(form);
    setScreenings([...screenings, newScreening.screening]);
  };

  return (
    <div>
      <h1>📅 Screenings</h1>
      <ul>
        {screenings.map((s) => (
          <li key={s.id}>
            Movie {s.movie_id} in Hall {s.hall_id} - {s.start_time}
          </li>
        ))}
      </ul>

      <h2>Add Screening</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Movie ID" onChange={(e) => setForm({ ...form, movie_id: e.target.value })} />
        <input placeholder="Hall ID" onChange={(e) => setForm({ ...form, hall_id: e.target.value })} />
        <input placeholder="Start Time" type="datetime-local" onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}
