// models/seatModel.js
import { promisePool } from "../db.js";

export const getSeatsByHall = async (hall_id) => {
  try {
    const hallId = parseInt(hall_id);
    if (!hallId || hallId <= 0) {
      throw new Error('ID sala non valido');
    }

    const [rows] = await promisePool.execute(
      "SELECT * FROM seats WHERE hall_id = ? ORDER BY seat_row, seat_column",
      [hallId]
    );
    return rows;
  } catch (error) {
    console.error('Errore recupero posti:', error);
    throw error;
  }
};

export const createSeatsForHall = async (hall_id, rows, columns) => {
  const seats = [];
  const rowsArray = Array.from({ length: rows }, (_, i) => 
    String.fromCharCode(65 + i)
  );

  for (const row of rowsArray) {
    for (let col = 1; col <= columns; col++) {
      const rowIndex = rowsArray.indexOf(row);
      const isPremium = rowIndex >= rows - 2;
      
      seats.push([
        hall_id,
        `${row}${col}`,
        row,
        col,
        isPremium ? 'premium' : 'standard'
      ]);
    }
  }

  try {
    if (seats.length === 0) {
      throw new Error('Nessun posto da creare');
    }

    const connection = await promisePool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Cancella i posti esistenti
      await connection.execute(
        'DELETE FROM seats WHERE hall_id = ?',
        [hall_id]
      );

      // ✅ Inserisce ogni posto individualmente
      for (const seat of seats) {
        await connection.execute(
          `INSERT INTO seats (hall_id, seat_number, seat_row, seat_column, seat_type) 
           VALUES (?, ?, ?, ?, ?)`,
          seat
        );
      }

      await connection.commit();
      console.log(`Creati ${seats.length} posti per sala ${hall_id}`);
      return seats.length;
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Errore creazione posti:', error);
    throw error;
  }
};

export const getAvailableSeats = async (screening_id, current_user_id) => {
  try {
    const screeningId = parseInt(screening_id);
    if (!screeningId || screeningId <= 0) {
      throw new Error('ID proiezione non valido');
    }

    const userId = current_user_id ? parseInt(current_user_id) : null;

    const [rows] = await promisePool.execute(
      `SELECT 
         s.*,
         CASE 
           -- Posto CONFERMATO (occupato da chiunque)
           WHEN EXISTS (
             SELECT 1 FROM tickets t 
             WHERE t.screening_id = ? 
               AND t.seat_number = s.seat_number 
               AND (t.status = 'confirmed' OR t.status = 'validated')
           ) THEN 'occupied'
           
           -- Posto RISERVATO da un ALTRO utente (non disponibile)
           WHEN EXISTS (
             SELECT 1 FROM tickets t 
             WHERE t.screening_id = ? 
               AND t.seat_number = s.seat_number 
               AND t.status = 'reserved' 
               AND t.reserved_until > NOW()
               AND (t.user_id != ? OR ? IS NULL)
           ) THEN 'reserved'
           
           -- Posto RISERVATO dall'UTENTE CORRENTE (disponibile per lui)
           WHEN EXISTS (
             SELECT 1 FROM tickets t 
             WHERE t.screening_id = ? 
               AND t.seat_number = s.seat_number 
               AND t.status = 'reserved' 
               AND t.reserved_until > NOW()
               AND t.user_id = ?
               AND ? IS NOT NULL
           ) THEN 'available'
           
           -- Posto completamente libero
           ELSE 'available'
         END as status
       FROM seats s
       WHERE s.hall_id = (
         SELECT hall_id FROM screenings WHERE id = ?
       )
       ORDER BY s.seat_row, s.seat_column`,
      [
        screeningId,
        screeningId, userId, userId,
        screeningId, userId, userId,
        screeningId
      ]
    );
    return rows;
  } catch (error) {
    console.error('Errore recupero posti disponibili:', error);
    throw error;
  }
};