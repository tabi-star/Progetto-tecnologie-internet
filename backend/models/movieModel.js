// models/movieModel.js
import db from "../db.js";

export const getAllMovies = (cb) => {
  db.query("SELECT * FROM movies ORDER BY createdAt DESC", cb);
};

export const getMovieById = (id, cb) => {
  db.query("SELECT * FROM movies WHERE id = ?", [id], cb);
};

export const getUpcomingMovies = (cb) => {
  const query = `
    SELECT * FROM movies 
    WHERE release_date > CURDATE() 
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