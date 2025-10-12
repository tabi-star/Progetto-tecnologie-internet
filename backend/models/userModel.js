// models/userModel.js
import db from "../db.js";
import bcrypt from "bcryptjs";

export const getAllUsers = (cb) => {
  db.query("SELECT id, name, email, role, createdAt FROM users", cb);
};

export const getUserByEmail = (email, cb) => {
  db.query("SELECT * FROM users WHERE email = ?", [email], cb);
};

export const insertUser = async (user, cb) => {
  try {
    const hashedPassword = await bcrypt.hash(user.password, 12);
    const userWithHash = { 
      ...user, 
      password: hashedPassword 
    };
    db.query("INSERT INTO users SET ?", userWithHash, cb);
  } catch (error) {
    cb(error);
  }
};

export const updateUser = (id, userData, cb) => {
  db.query("UPDATE users SET ? WHERE id = ?", [userData, id], cb);
};

export const deleteUser = (id, cb) => {
  db.query("DELETE FROM users WHERE id = ?", [id], cb);
};

export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};