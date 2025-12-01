import { promisePool } from "../db.js";

export const createDiscountCode = async (discount) => {
  try {
    if (!discount || typeof discount !== 'object') {
      throw new Error('Dati sconto non validi');
    }

    const requiredFields = ['code', 'discount_percent', 'valid_until', 'created_by'];
    for (const field of requiredFields) {
      if (!discount[field]) {
        throw new Error(`Campo obbligatorio mancante: ${field}`);
      }
    }

    const discountPercentage = parseInt(discount.discount_percent);
    if (discountPercentage <= 0 || discountPercentage > 100) {
      throw new Error('La percentuale di sconto deve essere tra 1 e 100');
    }

    // QUERY CORRETTA per MariaDB
    const [result] = await promisePool.execute(
      "INSERT INTO discount_codes (code, discount_percent, valid_until, created_by, created_at) VALUES (?, ?, ?, ?, ?)", 
      [
        discount.code,
        discount.discount_percent,
        discount.valid_until,
        discount.created_by,
        discount.created_at || new Date()
      ]
    );
    
    return result;
  } catch (error) {
    console.error('Errore creazione codice sconto:', error);
    throw error;
  }
};

export const deleteDiscountCode = async (id) => {
  try {
    const discountId = parseInt(id);
    if (!discountId || discountId <= 0) {
      throw new Error('ID codice sconto non valido');
    }

    const [result] = await promisePool.execute(
      "DELETE FROM discount_codes WHERE id = ?", 
      [discountId]
    );
    
    return result;
  } catch (error) {
    console.error('Errore eliminazione codice sconto:', error);
    throw error;
  }
};

export const getDiscountCodes = async (admin_id) => {
  try {
    const adminId = parseInt(admin_id);
    if (!adminId || adminId <= 0) {
      throw new Error('ID admin non valido');
    }

    const [rows] = await promisePool.execute(
      "SELECT * FROM discount_codes WHERE created_by = ? ORDER BY created_at DESC", 
      [adminId]
    );
    
    return rows;
  } catch (error) {
    console.error('Errore recupero codici sconto admin:', error);
    throw error;
  }
};

export const getValidDiscountCode = async (code) => {
  try {
    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      throw new Error('Codice sconto non valido');
    }

    const cleanCode = code.trim().toUpperCase();

    const [rows] = await promisePool.execute(
      "SELECT * FROM discount_codes WHERE code = ? AND DATE(valid_until) >= CURDATE() AND used = FALSE", 
      [cleanCode]
    );
    
    return rows[0] || null;
  } catch (error) {
    console.error('Errore verifica codice sconto:', error);
    throw error;
  }
};

export const markDiscountAsUsed = async (code_id, user_id) => {
  try {
    const discountId = parseInt(code_id);
    const userId = parseInt(user_id);

    if (!discountId || discountId <= 0) {
      throw new Error('ID codice sconto non valido');
    }

    if (!userId || userId <= 0) {
      throw new Error('ID utente non valido');
    }

    const [result] = await promisePool.execute(
      "UPDATE discount_codes SET used = TRUE, used_by = ?, used_at = NOW() WHERE id = ?", 
      [userId, discountId]
    );
    
    return result;
  } catch (error) {
    console.error('Errore marcatura codice sconto come usato:', error);
    throw error;
  }
};