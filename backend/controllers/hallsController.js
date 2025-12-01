import { getAllHalls, getHallById, insertHall, updateHall, deleteHall } from "../models/hallModel.js";
import { createSeatsForHall } from "../models/seatModel.js";

export const getHalls = async (req, res) => {
  try {
    const halls = await getAllHalls();
    res.json(halls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getHall = async (req, res) => {
  try {
    const { id } = req.params;
    const hall = await getHallById(id);
    
    if (!hall) {
      return res.status(404).json({ error: "Sala non trovata" });
    }
    
    res.json(hall);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addHall = async (req, res) => {
  try {
    const { id, name, hall_type, capacity } = req.body;

    const newHall = {
      id,
      name,
      hall_type: hall_type || "Standard",
      capacity,
      createdAt: new Date()
    };

    const result = await insertHall(newHall);
    newHall.id = result.insertId;
    
    res.status(201).json({ 
      message: "Sala aggiunta con successo", 
      hall: newHall 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const modifyHall = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, hall_type, capacity } = req.body;

    const updatedHall = {
      name,
      hall_type,
      capacity
    };

    const result = await updateHall(id, updatedHall);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Sala non trovata" });
    }
    
    res.json({ 
      message: "Sala aggiornata con successo", 
      hall: updatedHall 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeHall = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteHall(id);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Sala non trovata" });
    }
    
    res.json({ message: "Sala eliminata con successo" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const generateSeatsForHall = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows, columns } = req.body;

    if (!rows || !columns) {
      return res.status(400).json({ error: "Numero di file e colonne richiesto" });
    }

    if (rows <= 0 || columns <= 0) {
      return res.status(400).json({ error: "Il numero di file e colonne deve essere positivo" });
    }

    // Converte in numeri
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