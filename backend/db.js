import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectTimeout: 10000,      // Timeout connessione
  charset: 'utf8mb4',         // Charset
  timezone: 'local',          // Timezone
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Pool per async/await
export const promisePool = db.promise();

export default db;