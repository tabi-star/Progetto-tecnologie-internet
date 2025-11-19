// db.js
import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
    // Aggiunte dopo
  charset: 'utf8mb4', // Supporto caratteri speciali/emoji
  timezone: '+01:00', // Timezone Italia 
  acquireTimeout: 60000, // Timeout di 60 secondi per ottenere connessione
  reconnect: true // Auto-reconnect su errori
});

// Pool per async/await
export const promisePool = db.promise();

export default db;