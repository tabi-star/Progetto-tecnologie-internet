import { validateQRCode, markTicketAsUsed } from '../services/qrCodeReader.js';

export const verifyQRCode = async (req, res) => {
  try {
    const { qrText } = req.body;

    if (!qrText) {
      return res.status(400).json({
        success: false,
        error: 'Testo QR code mancante'
      });
    }

    const validationResult = await validateQRCode(qrText);

    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        error: validationResult.error
      });
    }

    res.json({
      success: true,
      data: validationResult.data
    });

  } catch (error) {
    console.error('❌ Errore verifica QR code:', error);
    res.status(500).json({
      success: false,
      error: 'Errore interno del server'
    });
  }
};

export const validateAndUseTicket = async (req, res) => {
  try {
    const { qrText } = req.body;

    if (!qrText) {
      return res.status(400).json({
        success: false,
        error: 'Testo QR code mancante'
      });
    }

    // Prima valida il QR code
    const validationResult = await validateQRCode(qrText);

    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        error: validationResult.error
      });
    }

    // Marca i ticket come utilizzati
    const ticket_ids = validationResult.data.ticket_ids;
    const usedTickets = [];

    for (const ticket_id of ticket_ids) {
      const updated = await markTicketAsUsed(ticket_id);
      if (updated) {
        usedTickets.push(ticket_id);
      }
    }

    if (usedTickets.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nessun ticket da validare (già confermati o cancellati)'
      });
    }

    res.json({
      success: true,
      message: `Ticket ${usedTickets.join(', ')} validati con successo`,
      data: {
        ...validationResult.data,
        used_tickets: usedTickets
      }
    });

  } catch (error) {
    console.error('❌ Errore validazione ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Errore interno del server'
    });
  }
};