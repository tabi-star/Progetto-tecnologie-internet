// models/seatModel.js
import { promisePool } from "../db.js";

export const getSeatsByHall = async (hall_id) => {
  const [rows] = await promisePool.execute(
    "SELECT * FROM seats WHERE hall_id = ? ORDER BY seat_row, seat_column",
    [hall_id]
  );
  return rows;
};

export const createSeatsForHall = async (hall_id, rows, columns) => {
  const seats = [];
  const rowsArray = Array.from({ length: rows }, (_, i) => 
    String.fromCharCode(65 + i)
  );

  for (const row of rowsArray) {
    for (let col = 1; col <= columns; col++) {
      // Le ultime due file (indici più alti) sono premium
      const rowIndex = rowsArray.indexOf(row);
      const isPremium = rowIndex >= rows - 2; // Ultime due file
      
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

    // CORREZIONE: Usa inserimenti singoli in una transazione
    const connection = await promisePool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Prima cancella i posti esistenti per questa sala (se necessario)
      await connection.execute(
        'DELETE FROM seats WHERE hall_id = ?',
        [hall_id]
      );

      // Inserisci ogni posto individualmente
      for (const seat of seats) {
        await connection.execute(
          `INSERT INTO seats (hall_id, seat_number, seat_row, seat_column, seat_type) 
           VALUES (?, ?, ?, ?, ?)`,
          seat
        );
      }

      await connection.commit();
      console.log(`✅ Creati ${seats.length} posti per sala ${hall_id}`);
      return seats.length;
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('❌ Errore creazione posti:', error);
    throw error;
  }
};

export const getAvailableSeats = async (screening_id) => {
  const [rows] = await promisePool.execute(
    `SELECT s.* 
     FROM seats s
     WHERE s.hall_id = (
       SELECT hall_id FROM screenings WHERE id = ?
     )
     AND s.seat_number NOT IN (
       SELECT seat_number FROM tickets 
       WHERE screening_id = ? AND status = 'confirmed'
       AND (reserved_until IS NULL OR reserved_until > NOW())
     )
     ORDER BY s.seat_row, s.seat_column`,
    [screening_id, screening_id]
  );
  return rows;
};