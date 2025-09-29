// controllers/hallsController.js
import { getAllHalls, insertHall } from "../models/hallModel.js";

export const getHalls = (req, res) => {
  getAllHalls((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

export const addHall = (req, res) => {
  const { name, hall_type, capacity } = req.body;

  const newHall = {
    name,
    hall_type,
    capacity,
    createdAt: new Date()
  };

  insertHall(newHall, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    newHall.id = result.insertId;
    res.status(201).json({ message: "Sala aggiunta con successo", hall: newHall });
  });
};
