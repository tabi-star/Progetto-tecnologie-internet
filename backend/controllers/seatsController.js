// controllers/seatsController.js
import { getAvailableSeats, getSeatsByHall } from "../models/seatModel.js";

export const getHallSeats = async (req, res) => {
  try {
    const { hall_id } = req.params;
    const seats = await getSeatsByHall(hall_id);
    res.json(seats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getScreeningSeats = async (req, res) => {
  try {
    const { screening_id } = req.params;
    const seats = await getAvailableSeats(screening_id);
    res.json(seats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};