// src/api/movies.js
import axios from "axios";

const API_URL = "http://localhost:3000/api/movies";

export const getMovies = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const addMovie = async (movie) => {
  const res = await axios.post(API_URL, movie);
  return res.data;
};
