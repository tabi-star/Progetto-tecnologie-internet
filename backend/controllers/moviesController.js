// controllers/moviesController.js
import { getAllMovies, getMovieById, getUpcomingMovies, insertMovie, updateMovie, deleteMovie } from "../models/movieModel.js";
import db from "../db.js";

export const getMovies = (req, res) => {
  getAllMovies((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

export const getUpcoming = (req, res) => {
  getUpcomingMovies((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

export const getMovie = (req, res) => {
  const { id } = req.params;
  getMovieById(id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "Film non trovato" });
    res.json(results[0]);
  });
};

export const getMoviesByScreeningsDate = (req, res) => {
  const { date } = req.params;

  const query = `
    SELECT DISTINCT m.*
    FROM movies m
    JOIN screenings s ON m.id = s.movie_id
    WHERE DATE(s.start_time) = ? AND s.start_time >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)
    ORDER BY m.title
  `;

  db.query(query, [date], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

export const addMovie = (req, res) => {
  const { title, description, duration_minutes, release_date, language, foto_locandina, banner_image } = req.body;

  const newMovie = {
    title,
    description,
    duration_minutes,
    release_date,
    language: language || "Italiano",
    foto_locandina,
    banner_image,
    createdAt: new Date()
  };

  insertMovie(newMovie, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    newMovie.id = result.insertId;
    res.status(201).json({ message: "Film aggiunto con successo", movie: newMovie });
  });
};

export const modifyMovie = (req, res) => {
  const { id } = req.params;
  const { title, description, duration_minutes, release_date, language, foto_locandina, banner_image } = req.body;

  const updatedMovie = {
    title,
    description,
    duration_minutes,
    release_date,
    language,
    foto_locandina,
    banner_image
  };

  updateMovie(id, updatedMovie, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Film non trovato" });
    res.json({ message: "Film aggiornato con successo", movie: updatedMovie });
  });
};

export const removeMovie = (req, res) => {
  const { id } = req.params;
  deleteMovie(id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Film non trovato" });
    res.json({ message: "Film eliminato con successo" });
  });
};