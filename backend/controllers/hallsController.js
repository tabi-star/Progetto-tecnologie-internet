// controllers/hallsController.js
import { getAllHalls, getHallById, insertHall, updateHall, deleteHall } from "../models/hallModel.js";
import { createSeatsForHall } from "../models/seatModel.js";

export const getHalls = (req, res) => {
  getAllHalls((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

export const getHall = (req, res) => {
  const { id } = req.params;
  getHallById(id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "Sala non trovata" });
    res.json(results[0]);
  });
};

export const addHall = (req, res) => {
  const { name, hall_type, capacity } = req.body;

  const newHall = {
    name,
    hall_type: hall_type || "Standard",
    capacity,
    createdAt: new Date()
  };

  insertHall(newHall, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    newHall.id = result.insertId;
    res.status(201).json({ message: "Sala aggiunta con successo", hall: newHall });
  });
};

export const modifyHall = (req, res) => {
  const { id } = req.params;
  const { name, hall_type, capacity } = req.body;

  const updatedHall = {
    name,
    hall_type,
    capacity
  };

  updateHall(id, updatedHall, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Sala non trovata" });
    res.json({ message: "Sala aggiornata con successo", hall: updatedHall });
  });
};

export const removeHall = (req, res) => {
  const { id } = req.params;
  deleteHall(id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Sala non trovata" });
    res.json({ message: "Sala eliminata con successo" });
  });
};

export const generateSeatsForHall = async (req, res) => {
  const { id } = req.params;
  const { rows, columns } = req.body;

  try {
    if (!rows || !columns) {
      return res.status(400).json({ error: "Numero di file e colonne richiesto" });
    }

    if (rows <= 0 || columns <= 0) {
      return res.status(400).json({ error: "Il numero di file e colonne deve essere positivo" });
    }

    // Converti in numeri
    const numRows = parseInt(rows);
    const numColumns = parseInt(columns);

    await createSeatsForHall(id, numRows, numColumns);
    
    res.json({ 
      success: true,
      message: `Posti generati con successo per la sala ${id}`,
      seats: {
        rows: numRows,
        columns: numColumns,
        total: numRows * numColumns
      }
    });
  } catch (error) {
    console.error('Errore generazione posti:', error);
    res.status(500).json({ error: "Errore nella generazione dei posti: " + error.message });
  }
};