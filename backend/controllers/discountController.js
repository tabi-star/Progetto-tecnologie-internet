import { 
  createDiscountCode, 
  deleteDiscountCode, 
  getDiscountCodes, 
  getValidDiscountCode, 
  markDiscountAsUsed 
} from "../models/discountModel.js";

export const generateDiscountCode = async (req, res) => {
  try {
    const { code, discount_percent, valid_until } = req.body;
    const adminId = req.user.id;

    // Validazione input
    if (discount_percent && (discount_percent < 1 || discount_percent > 100)) {
      return res.status(400).json({ error: "La percentuale di sconto deve essere tra 1 e 100" });
    }

    const discountCode = {
      code: code || `ADMIN${Date.now()}`,
      discount_percent: discount_percent || 20,
      valid_until: valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 giorni
      created_by: adminId,
      created_at: new Date()
    };

    const result = await createDiscountCode(discountCode);
    discountCode.id = result.insertId;
    
    res.status(201).json({ 
      message: "Codice sconto generato", 
      discount: discountCode 
    });
  } catch (error) {
    // Gestione errori specifica per duplicati
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: "Codice sconto già esistente" });
    }
    res.status(500).json({ error: error.message });
  }
};

export const removeDiscountCode = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteDiscountCode(id);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Codice sconto non trovato" });
    }

    res.json({ message: "Codice sconto eliminato con successo" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyDiscountCodes = async (req, res) => {
  try {
    const adminId = req.user.id;
    
    const discountCodes = await getDiscountCodes(adminId);
    res.json(discountCodes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const validateDiscountCode = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    // Validazione input
    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return res.status(400).json({ error: "Codice sconto non valido" });
    }

    const discount = await getValidDiscountCode(code);
    
    if (!discount) {
      return res.status(404).json({ error: "Codice sconto non valido o scaduto" });
    }

    res.json({ 
      valid: true, 
      discount_percent: discount.discount_percent,
      discount_id: discount.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const useDiscountCode = async (req, res) => {
  try {
    const { discount_id } = req.body;
    const userId = req.user.id;

    // Validazione input
    if (!discount_id) {
      return res.status(400).json({ error: "ID codice sconto mancante" });
    }

    const result = await markDiscountAsUsed(discount_id, userId);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Codice sconto non trovato" });
    }
    
    res.json({ message: "Codice sconto utilizzato con successo" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};