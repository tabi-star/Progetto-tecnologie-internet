// models/hallModel.js
import db from "../db.js";

export const getAllHalls = (cb) => {
  db.query("SELECT * FROM halls ORDER BY name", cb);
};

export const getHallById = (id, cb) => {
  db.query("SELECT * FROM halls WHERE id = ?", [id], cb);
};

export const insertHall = (hall, cb) => {
  db.query("INSERT INTO halls SET ?", hall, cb);
};

export const updateHall = (id, hall, cb) => {
  db.query("UPDATE halls SET ? WHERE id = ?", [hall, id], cb);
};

export const deleteHall = (id, cb) => {
  db.query("DELETE FROM halls WHERE id = ?", [id], cb);
};