// models/screeningModel.js
import { promisePool } from "../db.js";

export const getAllScreenings = async () => {
  try {
    const [rows] = await promisePool.execute(`
      SELECT s.*, m.title, m.duration_minutes, m.foto_locandina, h.name as hall_name, h.hall_type as hall_type, h.capacity
      FROM screenings s
      JOIN movies m ON s.movie_id = m.id
      JOIN halls h ON s.hall_id = h.id
      ORDER BY s.start_time ASC
    `);
    return rows;
  } catch (error) {
    console.error('Errore recupero proiezioni:', error);
    throw error;
  }
};

export const getScreeningById = async (id) => {
  try {
    const screeningId = parseInt(id);
    if (!screeningId || screeningId <= 0) {
      throw new Error('ID proiezione non valido');
    }

    const [rows] = await promisePool.execute(`
      SELECT s.*, m.title, m.duration_minutes, m.foto_locandina, h.name as hall_name
      FROM screenings s
      JOIN movies m ON s.movie_id = m.id
      JOIN halls h ON s.hall_id = h.id
      WHERE s.id = ?
    `, [screeningId]);
    
    return rows[0] || null;
  } catch (error) {
    console.error('Errore recupero proiezione:', error);
    throw error;
  }
};

export const countScreeningsTodayByHall = async (hall_id) => {
  try {
    const hallId = parseInt(hall_id);
    if (!hallId || hallId <= 0) {
      throw new Error('ID sala non valido');
    }

    const [results] = await promisePool.execute(`
      SELECT COUNT(*) as screenings_today
      FROM screenings
      WHERE hall_id = ? 
        AND DATE(start_time) = CURDATE()
    `, [hallId]);
    
    return results[0];
  } catch (error) {
    console.error('Errore conteggio proiezioni oggi:', error);
    throw error;
  }
};

export const insertScreening = async (screening) => {
  try {
    if (!screening || typeof screening !== 'object') {
      throw new Error('Dati proiezione non validi');
    }

    const requiredFields = ['movie_id', 'hall_id', 'start_time'];
    for (const field of requiredFields) {
      if (!screening[field]) {
        throw new Error(`Campo obbligatorio mancante: ${field}`);
      }
    }

    // ✅ QUERY per MariaDB
    const [result] = await promisePool.execute(
      "INSERT INTO screenings (movie_id, hall_id, start_time, createdAt) VALUES (?, ?, ?, ?)", 
      [
        screening.movie_id,
        screening.hall_id, 
        screening.start_time,
        screening.createdAt || new Date()
      ]
    );
    
    return result;
  } catch (error) {
    console.error('Errore inserimento proiezione:', error);
    throw error;
  }
};

export const updateScreening = async (id, screening) => {
  try {
    const screeningId = parseInt(id);
    if (!screeningId || screeningId <= 0) {
      throw new Error('ID proiezione non valido');
    }

    if (!screening || typeof screening !== 'object') {
      throw new Error('Dati proiezione non validi');
    }

    // ✅ QUERY per MariaDB - Costruzione dinamica
    const fields = [];
    const values = [];

    if (screening.movie_id !== undefined) {
      fields.push('movie_id = ?');
      values.push(screening.movie_id);
    }
    if (screening.hall_id !== undefined) {
      fields.push('hall_id = ?');
      values.push(screening.hall_id);
    }
    if (screening.start_time !== undefined) {
      fields.push('start_time = ?');
      values.push(screening.start_time);
    }

    if (fields.length === 0) {
      throw new Error('Nessun campo da aggiornare');
    }

    values.push(screeningId);

    const [result] = await promisePool.execute(
      `UPDATE screenings SET ${fields.join(', ')} WHERE id = ?`, 
      values
    );
    
    return result;
  } catch (error) {
    console.error('Errore aggiornamento proiezione:', error);
    throw error;
  }
};

export const deleteScreening = async (id) => {
  try {
    const screeningId = parseInt(id);
    if (!screeningId || screeningId <= 0) {
      throw new Error('ID proiezione non valido');
    }

    const [result] = await promisePool.execute(
      "DELETE FROM screenings WHERE id = ?", 
      [screeningId]
    );
    
    return result;
  } catch (error) {
    console.error('Errore eliminazione proiezione:', error);
    throw error;
  }
};