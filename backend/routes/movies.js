// routes/movies.js
import { Router } from "express";
import { getMovies, getMovie, getMoviesByScreeningsDate, getUpcoming, getAvailable, addMovie, modifyMovie, removeMovie } from "../controllers/moviesController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { validateMovie } from "../middleware/validation.js";

const router = Router();

router.get("/", getMovies);
router.post("/", authenticateToken, requireAdmin, validateMovie, addMovie);
router.get("/upcoming", getUpcoming);
router.get("/available", getAvailable);
router.get("/by-screenings/:date", getMoviesByScreeningsDate);
router.get("/:id", getMovie);
router.put("/:id", authenticateToken, requireAdmin, validateMovie, modifyMovie);
router.delete("/:id", authenticateToken, requireAdmin, removeMovie);

export default router;