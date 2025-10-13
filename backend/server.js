// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import moviesRoutes from "./routes/movies.js";
import usersRoutes from "./routes/users.js";
import hallsRoutes from "./routes/halls.js";
import screeningsRoutes from "./routes/screenings.js";
import ticketsRoutes from "./routes/tickets.js";
import paymentsRoutes from "./routes/payments.js";
import seatsRoutes from "./routes/seats.js";
import discountsRoutes from "./routes/discounts.js";

import db from "./db.js";

// Fix per __dirname con ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

// Test connessione DB
db.getConnection((err) => {
  if (err) {
    console.error("❌ Errore connessione DB:", err);
  } else {
    console.log("✅ Connesso al database MariaDB");
  }
});

// Routes
app.use("/api/movies", moviesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/halls", hallsRoutes);
app.use("/api/screenings", screeningsRoutes);
app.use("/api/tickets", ticketsRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/seats", seatsRoutes);
app.use("/api/discounts", discountsRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ 
    message: "🎬 Cinema API attiva", 
    version: "1.0.0",
    endpoints: [
      "/api/movies",
      "/api/users", 
      "/api/halls",
      "/api/screenings",
      "/api/tickets",
      "/api/payments",
      "/api/seats",
      "/api/discounts"
    ]
  });
});

// Route 404
app.use((req, res) => {
  res.status(404).json({ 
    error: "Route non trovata",
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Errore server:', err);
  res.status(500).json({ 
    error: "Errore interno del server",
    message: err.message 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server avviato su http://localhost:${PORT}`);
  console.log(`📧 Email configurata: ${process.env.EMAIL_USER ? '✅' : '❌'}`);
  console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? '✅' : '❌'}`);
});