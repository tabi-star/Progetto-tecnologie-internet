import { promisePool } from "../db.js";

const validateInput = (qrText, currentUserId) => {
  if (!qrText || typeof qrText !== 'string' || qrText.trim().length === 0) {
    throw new Error('Testo QR code non valido');
  }
  
  if (currentUserId && (isNaN(currentUserId) || currentUserId <= 0)) {
    throw new Error('User ID non valido');
  }
  
  return {
    cleanQrText: qrText.trim(),
    validUserId: currentUserId ? parseInt(currentUserId) : null
  };
};

export const validateQRCode = async (qrText, currentUserId = null) => {
  try {
    const { cleanQrText, validUserId } = validateInput(qrText, currentUserId);
    
    const parsedData = parseQRText(cleanQrText);
    
    if (!parsedData) {
      return {
        valid: false,
        error: 'Formato QR Code non valido'
      };
    }

    const { ticket_ids, timestamp, qrFileName } = parsedData;

    const qrAge = Date.now() - timestamp;
    const MAX_QR_AGE = 365 * 24 * 60 * 60 * 1000;
    if (qrAge > MAX_QR_AGE) {
      return {
        valid: false,
        error: 'QR code troppo vecchio'
      };
    }

    const ticketValidation = await validateTickets(ticket_ids, qrFileName, validUserId);
    
    if (!ticketValidation.valid) {
      return ticketValidation;
    }

    const filtered_ticket_ids = ticketValidation.tickets.map(t => t.id);
    const ticketsDetails = await getTicketDetails(filtered_ticket_ids);
    const ticketDetailsIds = ticketsDetails.map(t => t.id);

    return {
      valid: true,
      data: {
        ticket_ids: ticketDetailsIds,
        timestamp,
        qrFileName,
        tickets: ticketsDetails
      }
    };

  } catch (error) {
    console.error('Errore validazione QR code:', error);
    return {
      valid: false,
      error: 'Errore nella validazione del QR code: ' + error.message
    };
  }
};

export const parseQRText = (qrText) => {
  try {
    const cleanText = qrText.replace('.png', '');
    const parts = cleanText.split('_');
    
    if (parts.length < 3) {
      return null;
    }

    const ticketParts = parts.slice(1, -1);
    const timestampStr = parts[parts.length - 1];
    
    const ticket_ids = ticketParts.map(id => {
      const num = parseInt(id);
      if (isNaN(num)) {
        throw new Error(`ID ticket non numerico: ${id}`);
      }
      return num;
    });

    const timestamp = parseInt(timestampStr);
    if (isNaN(timestamp)) {
      throw new Error(`Timestamp non numerico: ${timestampStr}`);
    }

    const qrFileName = `ticket_${ticket_ids.join('_')}_${timestamp}.png`;
    
    return {
      ticket_ids,
      timestamp,
      qrFileName
    };
  } catch (error) {
    console.error('Errore parsing QR text:', error);
    return null;
  }
};

export const validateTickets = async (ticket_ids, qrFileName, currentUserId = null) => {
  try {
    if (!ticket_ids || ticket_ids.length === 0) {
      return {
        valid: false,
        error: 'Nessun ticket specificato'
      };
    }

    const placeholders = ticket_ids.map(() => '?').join(',');
    
    let userFilter = '';
    let queryParams = [...ticket_ids];
    
    if (currentUserId) {
      userFilter = ' AND t.user_id = ?';
      queryParams.push(currentUserId);
    }

    const [tickets] = await promisePool.execute(
      `SELECT t.id, t.status, t.screening_id, t.seat_number, 
              t.qr_code_url, t.price, t.bookedAt, t.user_id,
              s.start_time, s.movie_id, s.hall_id,
              m.title as movie_title, m.duration_minutes,
              h.name as hall_name,
              u.name as user_name, u.email as user_email
       FROM tickets t
       JOIN screenings s ON t.screening_id = s.id
       JOIN movies m ON s.movie_id = m.id
       JOIN halls h ON s.hall_id = h.id
       JOIN users u ON t.user_id = u.id
       WHERE t.id IN (${placeholders})${userFilter}`,
      queryParams
    );

    if (currentUserId && tickets.length === 0) {
      return {
        valid: false,
        error: 'Nessun ticket trovato per il tuo account'
      };
    }

    if (tickets.length !== ticket_ids.length) {
      const foundIds = tickets.map(t => t.id);
      const missingIds = ticket_ids.filter(id => !foundIds.includes(id));
      return {
        valid: false,
        error: `Ticket non trovati: ${missingIds.join(', ')}`
      };
    }

    const expectedQRUrl = `/qr-codes/${qrFileName}`;
    const validTickets = tickets.filter(t => t.qr_code_url === expectedQRUrl);

    if (validTickets.length === 0) {
      return {
        valid: false,
        error: 'Il QR code non corrisponde più a nessun ticket valido'
      };
    }

    const now = new Date();
    const expiredScreenings = validTickets.filter(t => new Date(t.start_time) < now);
    if (expiredScreenings.length > 0) {
      return {
        valid: false,
        error: `Proiezione già terminata per ticket ${expiredScreenings.map(t => t.id).join(', ')}`
      };
    }

    const screeningIds = [...new Set(validTickets.map(t => t.screening_id))];
    if (screeningIds.length > 1) {
      return {
        valid: false,
        error: 'I ticket appartengono a proiezioni diverse'
      };
    }
    
    return {
      valid: true,
      tickets: validTickets
    };

  } catch (error) {
    console.error('Errore validazione ticket:', error);
    return {
      valid: false,
      error: 'Errore nella validazione dei ticket'
    };
  }
};

export const getTicketDetails = async (ticket_ids) => {
  try {
    const placeholders = ticket_ids.map(() => '?').join(',');
    
    const [tickets] = await promisePool.execute(
      `SELECT 
        t.id,
        t.seat_number,
        t.status,
        t.price,
        t.bookedAt,
        t.qr_code_url,
        m.title as movie_title,
        m.duration_minutes,
        s.start_time,
        h.name as hall_name,
        u.name as user_name,
        u.email as user_email
       FROM tickets t
       JOIN screenings s ON t.screening_id = s.id
       JOIN movies m ON s.movie_id = m.id
       JOIN halls h ON s.hall_id = h.id
       JOIN users u ON t.user_id = u.id
       WHERE t.id IN (${placeholders})
       ORDER BY t.seat_number`,
      ticket_ids
    );

    return tickets;
  } catch (error) {
    console.error('Errore recupero dettagli ticket:', error);
    throw error;
  }
};

export const markTicketAsUsed = async (ticket_id) => {
  try {
    const [result] = await promisePool.execute(
      "UPDATE tickets SET status = 'validated' WHERE id = ? AND status = 'confirmed'",
      [ticket_id]
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error('Errore aggiornamento ticket:', error);
    throw error;
  }
};