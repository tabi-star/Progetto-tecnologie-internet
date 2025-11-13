// models/statsModel.js

import { promisePool } from "../db.js";

export const getAdminStats = async () => {
  try {
    // Film attivi (già usciti o in programmazione)
    const [moviesResult] = await promisePool.execute(
      `SELECT COUNT(*) as count FROM movies 
       WHERE release_date <= CURDATE()`
    );

    // Proiezioni attive oggi
    const [screeningsResult] = await promisePool.execute(
      `SELECT COUNT(*) as count FROM screenings 
       WHERE DATE(start_time) = CURDATE()`
    );

    // Biglietti venduti (tutti i biglietti, non solo dell'admin)
    const [ticketsResult] = await promisePool.execute(
      `SELECT COUNT(*) as count FROM tickets 
       WHERE status IN ('validated', 'confirmed')`
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

export const getDetailedStats = async () => {
  try {
    // Statistiche più dettagliate
    const [moviesStats] = await promisePool.execute(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN release_date > CURDATE() THEN 1 END) as upcoming,
        COUNT(CASE WHEN release_date <= CURDATE() THEN 1 END) as released
       FROM movies`
    );

    const [screeningsStats] = await promisePool.execute(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN DATE(start_time) = CURDATE() THEN 1 END) as today,
        COUNT(CASE WHEN DATE(start_time) > CURDATE() THEN 1 END) as upcoming
       FROM screenings`
    );

    const [ticketsStats] = await promisePool.execute(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'reserved' THEN 1 END) as reserved,
        COUNT(CASE WHEN status = 'confirmed' OR status = 'validated' THEN 1 END) as confirmed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
       FROM tickets`
    );

    const [revenueStats] = await promisePool.execute(
      `SELECT 
        COALESCE(SUM(price), 0) as total_revenue
       FROM tickets 
       WHERE status IN ('validated', 'confirmed')`
    );

    return {
      movies: moviesStats[0],
      screenings: screeningsStats[0],
      tickets: ticketsStats[0],
      revenue: revenueStats[0]
    };

  } catch (error) {
    console.error('❌ Errore recupero statistiche dettagliate:', error);
    throw error;
  }
};