// src/pages/MoviesPage.jsx

import { useEffect, useState } from "react";
import { getMovies, addMovie } from "../api/movies";

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    duration_minutes: "",
    release_date: "",
    language: "Italiano",
    foto_locandina: "",
    banner_image: "",
  });

  useEffect(() => {
    getMovies().then(setMovies);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newMovie = await addMovie(form);
    setMovies([...movies, newMovie.movie]);
  };

  return (
    <div>
      <h1>🎬 Movies</h1>
      <ul>
        {movies.map((m) => (
          <li key={m.id}>
            {m.title} ({m.language})
          </li>
        ))}
      </ul>

      <h2>Add Movie</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Title" onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input placeholder="Description" onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input placeholder="Duration (minutes)" type="number" onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} />
        <input placeholder="Release date" type="date" onChange={(e) => setForm({ ...form, release_date: e.target.value })} />
        <input placeholder="Poster URL" onChange={(e) => setForm({ ...form, foto_locandina: e.target.value })} />
        <input placeholder="Homepage banner image URL" onChange={(e) => setForm({ ...form, banner_image: e.target.value })} />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}
