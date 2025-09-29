// hallModel.js
import db from "../db.js";

export const getAllHalls = (cb) => {
  db.query("SELECT * FROM halls", cb);
};

export const insertHall = (hall, cb) => {
  db.query("INSERT INTO halls SET ?", hall, cb);
};
