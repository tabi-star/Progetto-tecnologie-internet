// middleware/validation.js
export const validateMovie = (req, res, next) => {
  const { title, duration_minutes, release_date } = req.body;
  
  if (!title || !duration_minutes || !release_date) {
    return res.status(400).json({ error: "Titolo, durata e data di uscita sono obbligatori" });
  }
  
  if (duration_minutes <= 0) {
    return res.status(400).json({ error: "Durata non valida" });
  }
  
  next();
};

export const validateScreening = (req, res, next) => {
  const { movie_id, hall_id, start_time } = req.body;
  
  if (!movie_id || !hall_id || !start_time) {
    return res.status(400).json({ error: "Film, sala e orario sono obbligatori" });
  }
  
  if (new Date(start_time) <= new Date()) {
    return res.status(400).json({ error: "L'orario deve essere futuro" });
  }
  
  next();
};

export const validateUser = (req, res, next) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Nome, email e password sono obbligatori" });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: "Password deve essere di almeno 6 caratteri" });
  }
  
  next();
};