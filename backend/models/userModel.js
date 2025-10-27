// models/userModel.js - VERSIONE AGGIORNATA
import { promisePool } from "../db.js";
import bcrypt from "bcryptjs";

export const getAllUsers = async () => {
  const [rows] = await promisePool.execute("SELECT id, name, email, role, createdAt FROM users");
  return rows;
};

export const getUserByEmail = async (email) => {
  const [rows] = await promisePool.execute("SELECT * FROM users WHERE email = ?", [email]);
  return rows;
};

export const getUserById = async (id) => {
  const [rows] = await promisePool.execute("SELECT id, name, email, role, createdAt FROM users WHERE id = ?", [id]);
  return rows[0];
};

export const insertUser = async (user) => {
  const hashedPassword = await bcrypt.hash(user.password, 12);
  const [result] = await promisePool.execute(
    "INSERT INTO users (name, email, password, role, createdAt) VALUES (?, ?, ?, ?, ?)",
    [user.name, user.email, hashedPassword, user.role || 'client', new Date()]
  );
  return result;
};

export const updateUser = async (id, userData) => {
  // Se c'è la password, hasha
  if (userData.password) {
    userData.password = await bcrypt.hash(userData.password, 12);
  }
  
  const [result] = await promisePool.execute("UPDATE users SET ? WHERE id = ?", [userData, id]);
  return result;
};

export const deleteUser = async (id) => {
  const [result] = await promisePool.execute("DELETE FROM users WHERE id = ?", [id]);
  return result;
};

export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};