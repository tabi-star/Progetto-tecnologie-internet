// models/userModel.js - VERSIONE AGGIORNATA
import { promisePool } from "../db.js";
import bcrypt from "bcryptjs";

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
  // Filtra solo i campi che sono stati forniti e non sono undefined
  const fieldsToUpdate = {};
  if (userData.name !== undefined) fieldsToUpdate.name = userData.name;
  if (userData.password !== undefined) {
    fieldsToUpdate.password = await bcrypt.hash(userData.password, 12);
  }

  // Se non ci sono campi da aggiornare, ritorna
  if (Object.keys(fieldsToUpdate).length === 0) {
    return { affectedRows: 0 };
  }

  // Costruisci la query dinamicamente
  const setClause = Object.keys(fieldsToUpdate).map(field => `${field} = ?`).join(', ');
  const values = Object.values(fieldsToUpdate);
  values.push(id); // Aggiungi l'ID alla fine

  const [result] = await promisePool.execute(
    `UPDATE users SET ${setClause} WHERE id = ?`,
    values
  );
  
  return result;
};

export const deleteUser = async (id) => {
  const [result] = await promisePool.execute("DELETE FROM users WHERE id = ?", [id]);
  return result;
};

export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};