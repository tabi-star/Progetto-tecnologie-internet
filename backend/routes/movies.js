// routes/movies.js
import { Router } from "express";
import { getMovies, getMovie, getUpcoming, addMovie, modifyMovie, removeMovie } from "../controllers/moviesController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { validateMovie } from "../middleware/validation.js";

const router = Router();

router.get("/", getMovies);
router.get("/upcoming", getUpcoming);
router.get("/:id", getMovie);
router.post("/", authenticateToken, requireAdmin, validateMovie, addMovie);
router.put("/:id", authenticateToken, requireAdmin, validateMovie, modifyMovie);
router.delete("/:id", authenticateToken, requireAdmin, removeMovie);

export default router;