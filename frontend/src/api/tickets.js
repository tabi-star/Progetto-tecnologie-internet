// src/api/tickets.js
import axios from "axios";

const API_URL = "http://localhost:3000/api/tickets";

export const getTickets = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const addTicket = async (ticket) => {
  const res = await axios.post(API_URL, ticket);
  return res.data;
};
