// controllers/screeningsController.js
import { getAllScreenings, insertScreening } from "../models/screeningModel.js";

export const getScreenings = (req, res) => {
  getAllScreenings((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

export const addScreening = (req, res) => {
  const { movie_id, hall_id, start_time } = req.body;

  const newScreening = {
    movie_id,
    hall_id,
    start_time,
    createdAt: new Date()
  };

  insertScreening(newScreening, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    newScreening.id = result.insertId;
    res.status(201).json({ message: "Proiezione aggiunta con successo", screening: newScreening });
  });
};
