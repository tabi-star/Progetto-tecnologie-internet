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
    const user_id = req.user?.id || null; // funziona con optionalAuth
        
    const seats = await getAvailableSeats(screening_id, user_id);
    res.json(seats);
  } catch (error) {
    console.error('❌ Errore recupero posti:', error);
    res.status(500).json({ error: error.message });
  }
};