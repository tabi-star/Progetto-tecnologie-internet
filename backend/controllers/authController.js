// controllers/authController.js

import { promisePool } from "../db.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../services/emailService.js";

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email è obbligatoria" });
  }

  try {
    // Verifica se l'utente esiste
    const [users] = await promisePool.execute(
      "SELECT id, name, email FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      // Per sicurezza, non rivelo se l'email esiste o meno
      return res.json({ 
        success: true, 
        message: "Se l'email esiste nel nostro sistema, riceverai un link di recupero" 
      });
    }

    const user = users[0];

    // Genera token univoco
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 ora

    // Salva il token nel database
    await promisePool.execute(
      "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
      [user.id, resetToken, expiresAt]
    );

    // Invia email di reset
    const emailSent = await sendPasswordResetEmail(user.email, user.name, resetToken);

    if (emailSent) {
      res.json({ 
        success: true, 
        message: "Se l'email esiste nel nostro sistema, riceverai un link di recupero" 
      });
    } else {
      throw new Error("Errore nell'invio dell'email");
    }

  } catch (error) {
    console.error('Errore in forgotPassword:', error);
    res.status(500).json({ error: "Errore interno del server" });
  }
};

export const verifyResetToken = async (req, res) => {
  const { token } = req.params;

  try {
    const [tokens] = await promisePool.execute(
      `SELECT pt.*, u.email 
       FROM password_reset_tokens pt 
       JOIN users u ON pt.user_id = u.id 
       WHERE pt.token = ? AND pt.expires_at > NOW() AND pt.used = FALSE`,
      [token]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ error: "Token non valido o scaduto" });
    }

    res.json({ 
      success: true, 
      message: "Token valido",
      email: tokens[0].email 
    });

  } catch (error) {
    console.error('Errore in verifyResetToken:', error);
    res.status(500).json({ error: "Errore interno del server" });
  }
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: "Token e password sono obbligatori" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "La password deve essere di almeno 6 caratteri" });
  }

  const connection = await promisePool.getConnection();

  try {
    await connection.beginTransaction();

    // Verifica il token
    const [tokens] = await connection.execute(
      `SELECT pt.*, u.id as user_id 
       FROM password_reset_tokens pt 
       JOIN users u ON pt.user_id = u.id 
       WHERE pt.token = ? AND pt.expires_at > NOW() AND pt.used = FALSE`,
      [token]
    );

    if (tokens.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: "Token non valido o scaduto" });
    }

    const resetToken = tokens[0];

    // Hash della nuova password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Aggiorna la password dell'utente
    await connection.execute(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, resetToken.user_id]
    );

    // Segna il token come usato
    await connection.execute(
      "UPDATE password_reset_tokens SET used = TRUE WHERE id = ?",
      [resetToken.id]
    );

    await connection.commit();

    res.json({ 
      success: true, 
      message: "Password reimpostata con successo" 
    });

  } catch (error) {
    await connection.rollback();
    console.error('Errore in resetPassword:', error);
    res.status(500).json({ error: "Errore interno del server" });
  } finally {
    connection.release();
  }
};