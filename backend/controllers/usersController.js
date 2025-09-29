// controllers/usersController.js
import { getAllUsers, insertUser } from "../models/userModel.js";

export const getUsers = (req, res) => {
  getAllUsers((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

export const addUser = (req, res) => {
  const { name, email, password, role } = req.body;

  const newUser = {
    name,
    email,
    password, // ⚠️ da criptare in produzione
    role: role || "client",
    createdAt: new Date()
  };

  insertUser(newUser, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    newUser.id = result.insertId;
    res.status(201).json({ message: "Utente aggiunto con successo", user: newUser });
  });
};
