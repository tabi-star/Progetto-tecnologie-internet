// controllers/screeningsController.js
import { getAllScreenings, getScreeningById, insertScreening, updateScreening, deleteScreening, countScreeningsTodayByHall } from "../models/screeningModel.js";
import db from "../db.js";

export const getScreenings = (req, res) => {
  getAllScreenings((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

/*Valutare se lasciare o togliere*/
/*export const getScreeningsByDate = (req, res) => {

  const { date } = req.params;
  
  const query = `
    SELECT s.*, h.name AS hall_name, h.hall_type, m.title, m.duration_minutes
    FROM screenings s
    JOIN halls h ON s.hall_id = h.id
    JOIN movies m ON s.movie_id = m.id
    WHERE DATE(s.start_time) = ?
    ORDER BY s.start_time ASC
    `;

  db.query(query, [date], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });

};*/

export const getScreeningsByMovieAndDate = (req, res) => {
  const { movie_id, date } = req.params;
  
  const query = `
    SELECT s.*, h.name as hall_name, h.hall_type, m.duration_minutes
    FROM screenings s
    JOIN halls h ON s.hall_id = h.id
    JOIN movies m ON s.movie_id = m.id
    WHERE s.movie_id = ? AND DATE(s.start_time) = ?
    ORDER BY s.start_time ASC
  `;
  
  db.query(query, [movie_id, date], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

export const getScreening = (req, res) => {
  const { id } = req.params;
  getScreeningById(id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "Proiezione non trovata" });
    res.json(results[0]);
  });
};

export const getScreeningsCountToday = (req, res) => {
  const { hall_id } = req.params;

  countScreeningsTodayByHall(hall_id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    /*res.json(result);*/
    res.json({ count: result.screenings_today })
  });
};

export const addScreening = (req, res) => {
  const { movie_id, hall_id, start_time } = req.body;

  const newScreening = {
    movie_id,
    hall_id,
    start_time,
    createdAt: new Date()
  };

  insertScreening(newScreening, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    newScreening.id = result.insertId;
    res.status(201).json({ message: "Proiezione aggiunta con successo", screening: newScreening });
  });
};

export const checkScreeningOverlap = (req, res) => {
  const { hall_id, start_time, movie_id } = req.body;
  
  const query = `
    SELECT s.*, m.title as movie_title, m.duration_minutes,
           TIMESTAMPADD(MINUTE, m.duration_minutes, s.start_time) as end_time
    FROM screenings s
    JOIN movies m ON s.movie_id = m.id
    WHERE s.hall_id = ? AND s.start_time BETWEEN DATE_SUB(?, INTERVAL 4 HOUR) AND DATE_ADD(?, INTERVAL 4 HOUR)
  `;
  
  db.query(query, [hall_id, start_time, start_time], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const newScreeningStart = new Date(start_time);
    let hasOverlap = false;
    const overlapping = [];

    // Ottieni durata del nuovo film
    db.query("SELECT duration_minutes FROM movies WHERE id = ?", [movie_id], (err, movieResults) => {
      if (err) return res.status(500).json({ error: err.message });
      
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
    });
  });
};

export const modifyScreening = (req, res) => {
  const { id } = req.params;
  const { movie_id, hall_id, start_time } = req.body;

  const updatedScreening = {
    movie_id,
    hall_id,
    start_time
  };

  updateScreening(id, updatedScreening, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Proiezione non trovata" });
    res.json({ message: "Proiezione aggiornata con successo", screening: updatedScreening });
  });
};

export const removeScreening = (req, res) => {
  const { id } = req.params;
  deleteScreening(id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Proiezione non trovata" });
    res.json({ message: "Proiezione eliminata con successo" });
  });
};