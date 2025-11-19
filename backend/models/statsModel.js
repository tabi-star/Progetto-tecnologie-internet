// models/statsModel.js

import { promisePool } from "../db.js";

export const getAdminStats = async () => {
  try {
    // Film attivi (già usciti o in programmazione)
    const [moviesResult] = await promisePool.execute(
      `SELECT COUNT(*) as count FROM movies 
       WHERE release_date <= CURDATE()`
    );

    // Tutte le proiezioni attive in giornata
    const [screeningsResult] = await promisePool.execute(
      `SELECT COUNT(*) as count FROM screenings 
       WHERE DATE(start_time) = CURDATE()`
    );

    // Tutti i biglietti venduti in giornata
    const [ticketsResult] = await promisePool.execute(
      `SELECT COUNT(*) as count FROM tickets 
       WHERE status IN ('validated', 'confirmed')
       AND DATE(bookedAt) = CURDATE()`
    );

    return {
      activeMovies: moviesResult[0].count,
      todayScreenings: screeningsResult[0].count,
      soldTickets: ticketsResult[0].count
    };

  } catch (error) {
    console.error('❌ Errore recupero statistiche admin:', error);
    throw error;
  }
};