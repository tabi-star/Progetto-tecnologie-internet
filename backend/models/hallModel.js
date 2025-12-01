import { promisePool } from "../db.js";

export const getAllHalls = async () => {
  try {
    const [rows] = await promisePool.execute("SELECT * FROM halls ORDER BY name");
    return rows;
  } catch (error) {
    console.error('Errore recupero sale:', error);
    throw error;
  }
};

export const getHallById = async (id) => {
  try {
    const hallId = parseInt(id);
    if (!hallId || hallId <= 0) {
      throw new Error('ID sala non valido');
    }

    const [rows] = await promisePool.execute("SELECT * FROM halls WHERE id = ?", [hallId]);
    return rows[0] || null;
  } catch (error) {
    console.error('Errore recupero sala:', error);
    throw error;
  }
};

export const insertHall = async (hall) => {
  try {
    if (!hall || typeof hall !== 'object') {
      throw new Error('Dati sala non validi');
    }

    const requiredFields = ['name', 'capacity'];
    for (const field of requiredFields) {
      if (hall[field] === undefined || hall[field] === null) {
        throw new Error(`Campo obbligatorio mancante: ${field}`);
      }
    }

    // QUERY per MariaDB
    const [result] = await promisePool.execute(
      "INSERT INTO halls (name, hall_type, capacity, createdAt) VALUES (?, ?, ?, ?)", 
      [
        hall.name,
        hall.hall_type || 'Standard',
        hall.capacity,
        hall.createdAt || new Date()
      ]
    );
    return result;
  } catch (error) {
    console.error('Errore creazione sala:', error);
    throw error;
  }
};

export const updateHall = async (id, hall) => {
  try {
    const hallId = parseInt(id);
    if (!hallId || hallId <= 0) {
      throw new Error('ID sala non valido');
    }

    if (!hall || typeof hall !== 'object') {
      throw new Error('Dati sala non validi');
    }

    // QUERY per MariaDB - Costruzione dinamica
    const fields = [];
    const values = [];

    if (hall.name !== undefined) {
      fields.push('name = ?');
      values.push(hall.name);
    }
    if (hall.hall_type !== undefined) {
      fields.push('hall_type = ?');
      values.push(hall.hall_type);
    }
    if (hall.capacity !== undefined) {
      fields.push('capacity = ?');
      values.push(hall.capacity);
    }

    if (fields.length === 0) {
      throw new Error('Nessun campo da aggiornare');
    }

    values.push(hallId);

    const [result] = await promisePool.execute(
      `UPDATE halls SET ${fields.join(', ')} WHERE id = ?`, 
      values
    );
    return result;
  } catch (error) {
    console.error('Errore aggiornamento sala:', error);
    throw error;
  }
};

export const deleteHall = async (id) => {
  try {
    const hallId = parseInt(id);
    if (!hallId || hallId <= 0) {
      throw new Error('ID sala non valido');
    }

    const [result] = await promisePool.execute(
      "DELETE FROM halls WHERE id = ?", 
      [hallId]
    );
    return result;
  } catch (error) {
    console.error('Errore eliminazione sala:', error);
    throw error;
  }
};