// controllers/moviesController.js
import { getAllMovies, insertMovie } from "../models/movieModel.js";

export const getMovies = (req, res) => {
  getAllMovies((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

export const addMovie = (req, res) => {
  const { title, description, duration_minutes, release_date, language, foto_locandina } = req.body;

  const newMovie = {
    title,
    description,
    duration_minutes,
    release_date,
    language,
    foto_locandina,
    createdAt: new Date()
  };

  insertMovie(newMovie, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    newMovie.id = result.insertId;
    res.status(201).json({ message: "Film aggiunto con successo", movie: newMovie });
  });
};
