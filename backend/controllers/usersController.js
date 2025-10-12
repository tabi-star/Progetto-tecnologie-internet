// controllers/usersController.js
import { getAllUsers, insertUser, getUserByEmail, verifyPassword, updateUser, deleteUser } from "../models/userModel.js";
import jwt from "jsonwebtoken";

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
    password,
    role: role || "client",
    createdAt: new Date()
  };

  insertUser(newUser, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: "Email già registrata" });
      }
      return res.status(500).json({ error: err.message });
    }
    
    const { password, ...userWithoutPassword } = newUser;
    userWithoutPassword.id = result.insertId;
    
    res.status(201).json({ 
      message: "Utente registrato con successo", 
      user: userWithoutPassword 
    });
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email e password sono obbligatori" });
  }

  getUserByEmail(email, async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(401).json({ error: "Credenziali non valide" });
    }

    const user = results[0];
    const validPassword = await verifyPassword(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: "Credenziali non valide" });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        name: user.name 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "Login effettuato con successo",
      token,
      user: userWithoutPassword
    });
  });
};

export const updateProfile = async (req, res) => {
  const { name, password } = req.body;
  const userId = req.user.id;

  try {
    const updateData = { name };
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    updateUser(userId, updateData, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: "Utente non trovato" });
      
      res.json({ message: "Profilo aggiornato con successo" });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAccount = (req, res) => {
  const userId = req.user.id;
  
  deleteUser(userId, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Utente non trovato" });
    
    res.json({ message: "Account eliminato con successo" });
  });
};