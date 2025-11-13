// controllers/usersController.js
import { getAllUsers, insertUser, getUserByEmail, getUserById, verifyPassword, updateUser, deleteUser } from "../models/userModel.js";
import jwt from "jsonwebtoken";

export const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getUserWithId = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({ error: "Utente non trovato" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const newUser = {
      name,
      email,
      password,
      role: role || "client",
      createdAt: new Date()
    };

    const result = await insertUser(newUser);
    
    const userWithoutPassword = {
      id: result.insertId,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt
    };
    
    res.status(201).json({ 
      message: "Utente registrato con successo", 
      user: userWithoutPassword 
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: "Email già registrata" });
    }
    res.status(500).json({ error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email e password sono obbligatori" });
    }

    const users = await getUserByEmail(email);
    
    if (users.length === 0) {
      return res.status(401).json({ error: "Credenziali non valide" });
    }

    const user = users[0];
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
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "Login effettuato con successo",
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Errore login:', error);
    res.status(500).json({ error: "Errore interno del server" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, password } = req.body;
    const userId = req.user.id;

    const updateData = { name };
    if (password) {
      updateData.password = password;
    }

    const result = await updateUser(userId, updateData);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Utente non trovato" });
    }
    
    res.json({ message: "Profilo aggiornato con successo" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await deleteUser(userId);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Utente non trovato" });
    }
    
    res.json({ message: "Account eliminato con successo" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};