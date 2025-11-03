// models/movieModel.js
import db from "../db.js";

export const getAllMovies = (cb) => {
  db.query("SELECT * FROM movies ORDER BY createdAt DESC", cb);
};

export const getMovieById = (id, cb) => {
  db.query("SELECT * FROM movies WHERE id = ?", [id], cb);
};
// Film che sono nell'intervallo "attivo" (da 1 settimana prima a 30 giorni dopo l'uscita)
export const getUpcomingMovies = (cb) => {
  const query = `
    SELECT * FROM movies 
    WHERE CURDATE() BETWEEN DATE_SUB(release_date, INTERVAL 7 DAY) AND DATE_ADD(release_date, INTERVAL 30 DAY) 
    ORDER BY release_date ASC 
    LIMIT 5
  `;
  db.query(query, cb);
};

export const insertMovie = (movie, cb) => {
  db.query("INSERT INTO movies SET ?", movie, cb);
};

export const updateMovie = (id, movie, cb) => {
  db.query("UPDATE movies SET ? WHERE id = ?", [movie, id], cb);
};

export const deleteMovie = (id, cb) => {
  db.query("DELETE FROM movies WHERE id = ?", [id], cb);
};