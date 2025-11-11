// models/screeningModel.js
import db from "../db.js";

export const getAllScreenings = (cb) => {
  db.query(`
    SELECT s.*, m.title, m.duration_minutes, m.foto_locandina, h.name as hall_name, h.hall_type as hall_type, h.capacity
    FROM screenings s
    JOIN movies m ON s.movie_id = m.id
    JOIN halls h ON s.hall_id = h.id
    WHERE s.start_time > NOW()
    ORDER BY s.start_time ASC
  `, cb);
};

export const getScreeningById = (id, cb) => {
  db.query(`
    SELECT s.*, m.title, m.duration_minutes, m.foto_locandina, h.name as hall_name
    FROM screenings s
    JOIN movies m ON s.movie_id = m.id
    JOIN halls h ON s.hall_id = h.id
    WHERE s.id = ?
  `, [id], cb);
};

export const countScreeningsTodayByHall = (hall_id, callback) => {
  const query = `
    SELECT COUNT(*) as screenings_today
    FROM screenings
    WHERE hall_id = ? 
      AND DATE(start_time) = CURDATE()
  `;

  db.query(query, [hall_id], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
};

export const insertScreening = (screening, cb) => {
  db.query("INSERT INTO screenings SET ?", screening, cb);
};

export const updateScreening = (id, screening, cb) => {
  db.query("UPDATE screenings SET ? WHERE id = ?", [screening, id], cb);
};

export const deleteScreening = (id, cb) => {
  db.query("DELETE FROM screenings WHERE id = ?", [id], cb);
};