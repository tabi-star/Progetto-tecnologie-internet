// controllers/moviesController.js
import { 
  getAllMovies, 
  getMovieById, 
  getUpcomingMovies, 
  getAvailableMovies, 
  insertMovie, 
  updateMovie, 
  deleteMovie 
} from "../models/movieModel.js";
import { promisePool } from "../db.js";

export const getMovies = async (req, res) => {
  try {
    const movies = await getAllMovies();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUpcoming = async (req, res) => {
  try {
    const upcomingMovies = await getUpcomingMovies();
    res.json(upcomingMovies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAvailable = async (req, res) => {
  try {
    const availableMovies = await getAvailableMovies();
    res.json(availableMovies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await getMovieById(id);
    
    if (!movie) {
      return res.status(404).json({ error: "Film non trovato" });
    }
    
    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMoviesByScreeningsDate = async (req, res) => {
  try {
    const { date } = req.params;

    // ✅ Validazione input
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: "Formato data non valido (YYYY-MM-DD)" });
    }

    const query = `
      SELECT DISTINCT m.*
      FROM movies m
      JOIN screenings s ON m.id = s.movie_id
      WHERE DATE(s.start_time) = ? AND s.start_time >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)
      ORDER BY m.title
    `;

    const [results] = await promisePool.execute(query, [date]);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addMovie = async (req, res) => {
  try {
    const { title, description, duration_minutes, release_date, language, foto_locandina, banner_image } = req.body;

    // ✅ Validazione input
    if (!title || !release_date) {
      return res.status(400).json({ error: "Titolo e data di uscita sono obbligatori" });
    }

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

    const result = await insertMovie(newMovie);
    newMovie.id = result.insertId;
    
    res.status(201).json({ 
      message: "Film aggiunto con successo", 
      movie: newMovie 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const modifyMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, duration_minutes, release_date, language, foto_locandina, banner_image } = req.body;

    // ✅ Validazione input
    if (!title || !release_date) {
      return res.status(400).json({ error: "Titolo e data di uscita sono obbligatori" });
    }

    const updatedMovie = {
      title,
      description,
      duration_minutes,
      release_date,
      language,
      foto_locandina,
      banner_image
    };

    const result = await updateMovie(id, updatedMovie);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Film non trovato" });
    }
    
    res.json({ 
      message: "Film aggiornato con successo", 
      movie: updatedMovie 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteMovie(id);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Film non trovato" });
    }
    
    res.json({ message: "Film eliminato con successo" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};