// controllers/discountController.js
import { createDiscountCode, getAdminDiscountCodes, getValidDiscountCode, markDiscountAsUsed } from "../models/discountModel.js";

export const generateDiscountCode = (req, res) => {
  const { code, discount_percent, valid_until } = req.body;
  const adminId = req.user.id;

  const discountCode = {
    code: code || `ADMIN${Date.now()}`,
    discount_percent: discount_percent || 20,
    valid_until: valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 giorni
    created_by: adminId,
    created_at: new Date()
  };

  createDiscountCode(discountCode, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: "Codice sconto già esistente" });
      }
      return res.status(500).json({ error: err.message });
    }
    discountCode.id = result.insertId;
    res.status(201).json({ message: "Codice sconto generato", discount: discountCode });
  });
};

export const getMyDiscountCodes = (req, res) => {
  const adminId = req.user.id;
  
  getAdminDiscountCodes(adminId, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

export const validateDiscountCode = (req, res) => {
  const { code } = req.body;
  const userId = req.user.id;

  getValidDiscountCode(code, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(404).json({ error: "Codice sconto non valido o scaduto" });
    }

    const discount = results[0];
    res.json({ 
      valid: true, 
      discount_percent: discount.discount_percent,
      discount_id: discount.id
    });
  });
};

export const useDiscountCode = (req, res) => {
  const { discount_id } = req.body;
  const userId = req.user.id;

  markDiscountAsUsed(discount_id, userId, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Codice sconto non trovato" });
    
    res.json({ message: "Codice sconto utilizzato con successo" });
  });
};