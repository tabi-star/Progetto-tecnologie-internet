// routes/movies.js
import { Router } from "express";
import { getMovies, addMovie } from "../controllers/moviesController.js";

const router = Router();

router.get("/", getMovies);
router.post("/", addMovie);

export default router;
