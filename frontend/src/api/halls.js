// src/api/halls.js
import axios from "axios";

const API_URL = "http://localhost:3000/api/halls";

export const getHalls = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const addHall = async (hall) => {
  const res = await axios.post(API_URL, hall);
  return res.data;
};
