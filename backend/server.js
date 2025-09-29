// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import moviesRoutes from "./routes/movies.js";
import usersRoutes from "./routes/users.js";
import hallsRoutes from "./routes/halls.js";
import screeningsRoutes from "./routes/screenings.js";
import ticketsRoutes from "./routes/tickets.js";

import db from "./db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Test connessione DB
db.getConnection((err) => {
  if (err) {
    console.error("Errore connessione DB:", err);
  } else {
    console.log("Connesso al database MariaDB.");
  }
});

// Rotte
app.use("/api/movies", moviesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/halls", hallsRoutes);
app.use("/api/screenings", screeningsRoutes);
app.use("/api/tickets", ticketsRoutes);

// Rotta base di test
app.get("/", (req, res) => {
  res.send("API Cinema attiva");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server avviato su http://localhost:${PORT}`));
