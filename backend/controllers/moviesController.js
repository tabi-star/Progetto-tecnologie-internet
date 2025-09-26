// Controller: gestisce la logica

// GET /api/movies
export const getMovies = (req, res) => {
  res.json([{ id: 1, title: "Inception" }, { id: 2, title: "Interstellar" }]);
};

// POST /api/movies
export const addMovie = (req, res) => {
  const newMovie = req.body;
  res.status(201).json({ message: "Film aggiunto con successo", movie: newMovie });
};
