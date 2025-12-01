import { 
  getAllScreenings, 
  getScreeningById, 
  insertScreening, 
  updateScreening, 
  deleteScreening, 
  countScreeningsTodayByHall 
} from "../models/screeningModel.js";
import { promisePool } from "../db.js";

export const getScreenings = async (req, res) => {
  try {
    const screenings = await getAllScreenings();
    res.json(screenings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getScreeningsByMovieAndDate = async (req, res) => {
  try {
    const { movie_id, date } = req.params;
    
    // Validazione input
    const movieId = parseInt(movie_id);
    if (!movieId || movieId <= 0) {
      return res.status(400).json({ error: "ID film non valido" });
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: "Formato data non valido (YYYY-MM-DD)" });
    }

    const query = `
      SELECT s.*, h.name as hall_name, h.hall_type, m.title, m.duration_minutes
      FROM screenings s
      JOIN halls h ON s.hall_id = h.id
      JOIN movies m ON s.movie_id = m.id
      WHERE s.movie_id = ? AND DATE(s.start_time) = ? AND s.start_time >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)
      ORDER BY s.start_time ASC
    `;
    
    const [results] = await promisePool.execute(query, [movieId, date]);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getScreening = async (req, res) => {
  try {
    const { id } = req.params;
    const screening = await getScreeningById(id);
    
    if (!screening) {
      return res.status(404).json({ error: "Proiezione non trovata" });
    }
    
    res.json(screening);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getScreeningsCountToday = async (req, res) => {
  try {
    const { hall_id } = req.params;
    
    // Validazione input
    const hallId = parseInt(hall_id);
    if (!hallId || hallId <= 0) {
      return res.status(400).json({ error: "ID sala non valido" });
    }

    const result = await countScreeningsTodayByHall(hallId);
    res.json({ count: result.screenings_today });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addScreening = async (req, res) => {
  try {
    const { movie_id, hall_id, start_time } = req.body;

    // Validazione input
    if (!movie_id || !hall_id || !start_time) {
      return res.status(400).json({ error: "Campi obbligatori mancanti" });
    }

    // Controlla la data di uscita del film
    const [movieResults] = await promisePool.execute(
      "SELECT release_date FROM movies WHERE id = ?", 
      [movie_id]
    );
    
    if (movieResults.length === 0) {
      return res.status(404).json({ error: "Film non trovato" });
    }

    const releaseDate = new Date(movieResults[0].release_date);
    const screeningStart = new Date(start_time);

    if (screeningStart < releaseDate) {
      return res.status(400).json({ 
        error: "Non è possibile creare una proiezione prima della data di uscita del film." 
      });
    }

    const newScreening = {
      movie_id,
      hall_id,
      start_time,
      createdAt: new Date()
    };

    const result = await insertScreening(newScreening);
    newScreening.id = result.insertId;
    
    res.status(201).json({ 
      message: "Proiezione aggiunta con successo", 
      screening: newScreening 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const checkScreeningOverlap = async (req, res) => {
  try {
    const { hall_id, start_time, movie_id, screening_id } = req.body;
    
    // Validazione input
    if (!hall_id || !start_time || !movie_id) {
      return res.status(400).json({ error: "Campi obbligatori mancanti" });
    }

    const query = `
      SELECT s.*, m.title as movie_title, m.duration_minutes,
             TIMESTAMPADD(MINUTE, m.duration_minutes, s.start_time) as end_time
      FROM screenings s
      JOIN movies m ON s.movie_id = m.id
      WHERE s.hall_id = ? AND s.start_time BETWEEN DATE_SUB(?, INTERVAL 4 HOUR) AND DATE_ADD(?, INTERVAL 4 HOUR)
      ${screening_id ? "AND s.id <> ?" : ""}
    `;

    const queryParams = screening_id ? [hall_id, start_time, start_time, screening_id] : [hall_id, start_time, start_time];
    
    const [results] = await promisePool.execute(query, queryParams);
    
    const newScreeningStart = new Date(start_time);
    let hasOverlap = false;
    const overlapping = [];

    // Ottieni durata del nuovo film
    const [movieResults] = await promisePool.execute(
      "SELECT duration_minutes FROM movies WHERE id = ?", 
      [movie_id]
    );
    
    const newMovieDuration = movieResults[0]?.duration_minutes || 120;
    const newScreeningEnd = new Date(newScreeningStart.getTime() + newMovieDuration * 60000);

    results.forEach(screening => {
      const existingStart = new Date(screening.start_time);
      const existingEnd = new Date(screening.end_time);

      if (
        (newScreeningStart >= existingStart && newScreeningStart < existingEnd) ||
        (newScreeningEnd > existingStart && newScreeningEnd <= existingEnd) ||
        (newScreeningStart <= existingStart && newScreeningEnd >= existingEnd)
      ) {
        hasOverlap = true;
        overlapping.push({
          id: screening.id,
          movie_title: screening.movie_title,
          start_time: screening.start_time,
          end_time: screening.end_time
        });
      }
    });

    res.json({ 
      hasOverlap,
      overlappingScreenings: overlapping,
      newScreening: {
        start_time: newScreeningStart,
        end_time: newScreeningEnd
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const modifyScreening = async (req, res) => {
  try {
    const { id } = req.params;
    const { movie_id, hall_id, start_time } = req.body;

    // Validazione input
    if (!movie_id || !hall_id || !start_time) {
      return res.status(400).json({ error: "Campi obbligatori mancanti" });
    }

    // Controlla la data di uscita del film
    const [movieResults] = await promisePool.execute(
      "SELECT release_date FROM movies WHERE id = ?", 
      [movie_id]
    );
    
    if (movieResults.length === 0) {
      return res.status(404).json({ error: "Film non trovato" });
    }

    const releaseDate = new Date(movieResults[0].release_date);
    const screeningStart = new Date(start_time);

    if (screeningStart < releaseDate) {
      return res.status(400).json({ 
        error: "Non è possibile modificare una proiezione con data precedente all'uscita del film." 
      });
    }

    const updatedScreening = {
      movie_id,
      hall_id,
      start_time
    };

    const result = await updateScreening(id, updatedScreening);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Proiezione non trovata" });
    }
    
    res.json({ 
      message: "Proiezione aggiornata con successo", 
      screening: updatedScreening 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeScreening = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteScreening(id);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Proiezione non trovata" });
    }
    
    res.json({ message: "Proiezione eliminata con successo" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};