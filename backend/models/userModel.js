// models/userModel.js
import db from "../db.js";

export const getAllUsers = (cb) => {
  db.query("SELECT id, name, email, role, createdAt FROM users", cb);
};

export const insertUser = (user, cb) => {
  db.query("INSERT INTO users SET ?", user, cb);
};
