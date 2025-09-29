// movieModel.js
import db from "../db.js";

export const getAllMovies = (cb) => {
  db.query("SELECT * FROM movies", cb);
};

export const insertMovie = (movie, cb) => {
  db.query("INSERT INTO movies SET ?", movie, cb);
};
