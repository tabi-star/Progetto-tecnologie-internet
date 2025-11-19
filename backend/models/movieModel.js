// models/movieModel.js
import { promisePool } from "../db.js";

export const getAllMovies = async () => {
  try {
    const [rows] = await promisePool.execute(
      "SELECT * FROM movies ORDER BY createdAt DESC"
    );
    return rows;
  } catch (error) {
    console.error('Errore recupero film:', error);
    throw error;
  }
};

export const getMovieById = async (id) => {
  try {
    const movieId = parseInt(id);
    if (!movieId || movieId <= 0) {
      throw new Error('ID film non valido');
    }

    const [rows] = await promisePool.execute(
      "SELECT * FROM movies WHERE id = ?", 
      [movieId]
    );
    
    return rows[0] || null;
  } catch (error) {
    console.error('Errore recupero film:', error);
    throw error;
  }
};

export const getUpcomingMovies = async () => {
  try {
    const query = `
      SELECT * FROM movies 
      WHERE CURDATE() BETWEEN DATE_SUB(release_date, INTERVAL 7 DAY) AND DATE_ADD(release_date, INTERVAL 30 DAY) 
      ORDER BY release_date ASC 
      LIMIT 5
    `;
    
    const [rows] = await promisePool.execute(query);
    return rows;
  } catch (error) {
    console.error('Errore recupero film in arrivo:', error);
    throw error;
  }
};

export const getAvailableMovies = async () => {
  try {
    const query = `
      SELECT DISTINCT 
        m.*,
        COUNT(s.id) as screening_count,
        MIN(s.start_time) as next_screening
      FROM movies m
      INNER JOIN screenings s ON m.id = s.movie_id
      WHERE s.start_time > NOW()
      AND m.release_date <= CURDATE()
      GROUP BY m.id
      ORDER BY next_screening ASC, m.title ASC
    `;
    
    const [rows] = await promisePool.execute(query);
    return rows;
  } catch (error) {
    console.error('Errore recupero film disponibili:', error);
    throw error;
  }
};

export const insertMovie = async (movie) => {
  try {
    if (!movie || typeof movie !== 'object') {
      throw new Error('Dati film non validi');
    }

    const requiredFields = ['title', 'release_date'];
    for (const field of requiredFields) {
      if (!movie[field]) {
        throw new Error(`Campo obbligatorio mancante: ${field}`);
      }
    }

    // ✅ QUERY per MariaDB
    const [result] = await promisePool.execute(
      "INSERT INTO movies (title, description, duration_minutes, release_date, language, foto_locandina, banner_image, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", 
      [
        movie.title,
        movie.description || null,
        movie.duration_minutes || null,
        movie.release_date,
        movie.language || 'Italiano',
        movie.foto_locandina || null,
        movie.banner_image || null,
        movie.createdAt || new Date()
      ]
    );
    
    return result;
  } catch (error) {
    console.error('Errore inserimento film:', error);
    throw error;
  }
};

export const updateMovie = async (id, movie) => {
  try {
    const movieId = parseInt(id);
    if (!movieId || movieId <= 0) {
      throw new Error('ID film non valido');
    }

    if (!movie || typeof movie !== 'object') {
      throw new Error('Dati film non validi');
    }

    // ✅ QUERY per MariaDB - Costruzione dinamica
    const fields = [];
    const values = [];

    if (movie.title !== undefined) {
      fields.push('title = ?');
      values.push(movie.title);
    }
    if (movie.description !== undefined) {
      fields.push('description = ?');
      values.push(movie.description);
    }
    if (movie.duration_minutes !== undefined) {
      fields.push('duration_minutes = ?');
      values.push(movie.duration_minutes);
    }
    if (movie.release_date !== undefined) {
      fields.push('release_date = ?');
      values.push(movie.release_date);
    }
    if (movie.language !== undefined) {
      fields.push('language = ?');
      values.push(movie.language);
    }
    if (movie.foto_locandina !== undefined) {
      fields.push('foto_locandina = ?');
      values.push(movie.foto_locandina);
    }
    if (movie.banner_image !== undefined) {
      fields.push('banner_image = ?');
      values.push(movie.banner_image);
    }

    if (fields.length === 0) {
      throw new Error('Nessun campo da aggiornare');
    }

    values.push(movieId);

    const [result] = await promisePool.execute(
      `UPDATE movies SET ${fields.join(', ')} WHERE id = ?`, 
      values
    );
    
    return result;
  } catch (error) {
    console.error('Errore aggiornamento film:', error);
    throw error;
  }
};

export const deleteMovie = async (id) => {
  try {
    const movieId = parseInt(id);
    if (!movieId || movieId <= 0) {
      throw new Error('ID film non valido');
    }

    const [result] = await promisePool.execute(
      "DELETE FROM movies WHERE id = ?", 
      [movieId]
    );
    
    return result;
  } catch (error) {
    console.error('Errore eliminazione film:', error);
    throw error;
  }
};