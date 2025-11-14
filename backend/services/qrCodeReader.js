// services/qrCodeReader.js

import { promisePool } from "../db.js";

export const validateQRCode = async (qrText, currentUserId = null) => {
  try {
    console.log('🔍 Validazione QR code:', qrText);
    console.log('👤 User ID corrente:', currentUserId);
    
    // Parsing del testo del QR code
    const parsedData = parseQRText(qrText);
    
    if (!parsedData) {
      return {
        valid: false,
        error: 'Formato QR code non valido'
      };
    }

    const { ticket_ids, timestamp, qrFileName } = parsedData;

    // ✅ PASSA IL currentUserId ALLA VALIDAZIONE
    const ticketValidation = await validateTickets(ticket_ids, qrFileName, currentUserId);
    
    if (!ticketValidation.valid) {
      return ticketValidation;
    }

    // Recupera informazioni dettagliate sui ticket
    const ticketDetails = await getTicketDetails(ticket_ids);

    return {
      valid: true,
      data: {
        ticket_ids,
        timestamp,
        qrFileName,
        tickets: ticketDetails
      }
    };

  } catch (error) {
    console.error('❌ Errore validazione QR code:', error);
    return {
      valid: false,
      error: 'Errore nella validazione del QR code'
    };
  }
};

export const parseQRText = (qrText) => {
  try {
    console.log('📝 Parsing QR text:', qrText);
    
    // Formato: "ticket_11_1700000000000" o "ticket_1_2_1700000000000"
    // Rimuovi eventuale estensione .png se presente
    const cleanText = qrText.replace('.png', '');
    
    // Split per underscore
    const parts = cleanText.split('_');
    
    if (parts.length < 3) {
      console.log('❌ Formato non valido: parti insufficienti');
      return null;
    }

    // La prima parte è "ticket", le parti centrali sono gli ID, l'ultima è il timestamp
    const ticketParts = parts.slice(1, -1); // Prendi tutto tranne primo ("ticket") e ultimo (timestamp)
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

    // Ricostruisce il nome file completo
    const qrFileName = `ticket_${ticket_ids.join('_')}_${timestamp}.png`;

    console.log('✅ Parsing completato:', { ticket_ids, timestamp, qrFileName });
    
    return {
      ticket_ids,
      timestamp,
      qrFileName
    };
  } catch (error) {
    console.error('❌ Errore parsing QR text:', error);
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

    console.log('🎫 Validazione ticket IDs:', ticket_ids);
    console.log('📁 QR code file atteso:', qrFileName);
    console.log('👤 User ID corrente:', currentUserId);

    // Query per verificare che i ticket esistano E che il QR code URL corrisponda
    const placeholders = ticket_ids.map(() => '?').join(',');
    
    // AGGIUNGI IL FILTRO PER USER ID SE FORNITO
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

    console.log('📊 Ticket trovati nel DB:', tickets.length);

    // ✅ AGGIUNGI CONTROLLO: Se currentUserId è fornito ma non trova ticket
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

    // VERIFICA CRITICA: Controlla che ALMENO UN ticket abbia il QR code corrispondente
    const expectedQRUrl = `/qr-codes/${qrFileName}`;
    console.log('🔗 QR code URL atteso:', expectedQRUrl);

    const ticketsWithMatchingQR = tickets.filter(t => t.qr_code_url === expectedQRUrl);

    // ✅ MODIFICA: Ora controlla se ALMENO UN ticket corrisponde
    if (ticketsWithMatchingQR.length === 0) {
      console.log('❌ Nessun ticket trovato con QR code corrispondente');
      console.log('Ticket disponibili:', tickets.map(t => ({
        id: t.id,
        qr_code_url: t.qr_code_url
      })));
      
      return {
        valid: false,
        error: 'QR code non valido o scaduto'
      };
    }

    // Se arriviamo qui, ALMENO UN ticket ha il QR code corrispondente
    console.log(`✅ QR code valido per ${ticketsWithMatchingQR.length} ticket su ${tickets.length}`);

    console.log('✅ Tutti i ticket hanno il QR code URL corretto');

    // Controlla se ci sono ticket cancellati
    const cancelledTickets = tickets.filter(t => t.status === 'cancelled');
    if (cancelledTickets.length > 0) {
      return {
        valid: false,
        error: `Ticket ${cancelledTickets.map(t => t.id).join(', ')} cancellati`
      };
    }

    // Controlla se la proiezione è già passata
    const now = new Date();
    const expiredScreenings = tickets.filter(t => new Date(t.start_time) < now);
    if (expiredScreenings.length > 0) {
      return {
        valid: false,
        error: `Proiezione già terminata per ticket ${expiredScreenings.map(t => t.id).join(', ')}`
      };
    }

    // Verifica che tutti i ticket appartengano alla stessa proiezione
    const screeningIds = [...new Set(tickets.map(t => t.screening_id))];
    if (screeningIds.length > 1) {
      return {
        valid: false,
        error: 'I ticket appartengono a proiezioni diverse'
      };
    }

    console.log('✅ Validazione ticket completata con successo');
    
    return {
      valid: true,
      tickets: tickets
    };

  } catch (error) {
    console.error('❌ Errore validazione ticket:', error);
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
    console.error('❌ Errore recupero dettagli ticket:', error);
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
    console.error('❌ Errore aggiornamento ticket:', error);
    throw error;
  }
};