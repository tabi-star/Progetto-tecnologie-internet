// screeningModel.js
import db from "../db.js";

export const getAllScreenings = (cb) => {
  db.query("SELECT * FROM screenings", cb);
};

export const insertScreening = (screening, cb) => {
  db.query("INSERT INTO screenings SET ?", screening, cb);
};
