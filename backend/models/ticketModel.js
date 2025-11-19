// models/ticketModel.js
import { promisePool } from "../db.js";
import { sendConfirmationEmail } from '../services/emailService.js';

// ✅ FUNZIONI DI VALIDAZIONE per evitare SQL INJECTION
const validateSeatNumbers = (seat_numbers) => {
  if (!Array.isArray(seat_numbers) || seat_numbers.length === 0) {
    return false;
  }
  
  if (seat_numbers.length > 30) {
    return false;
  }
  
  return seat_numbers.every(seat => {
    if (typeof seat !== 'string') return false;
    return /^[A-Z][1-9][0-9]?$/.test(seat);
  });
};

const validateTicketIds = (ticket_ids) => {
  if (!Array.isArray(ticket_ids) || ticket_ids.length === 0) {
    return false;
  }
  
  if (ticket_ids.length > 30) {
    return false;
  }
  
  return ticket_ids.every(id => {
    const numId = Number(id);
    return Number.isInteger(numId) && numId > 0;
  });
};

export const getAllTickets = async () => {
  try {
    const [rows] = await promisePool.execute(`
      SELECT t.*, m.title, s.start_time, h.name as hall_name, u.name as user_name
      FROM tickets t
      JOIN screenings s ON t.screening_id = s.id
      JOIN movies m ON s.movie_id = m.id
      JOIN halls h ON s.hall_id = h.id
      JOIN users u ON t.user_id = u.id
      ORDER BY t.bookedAt DESC
    `);
    return rows;
  } catch (error) {
    console.error('Errore recupero biglietti:', error);
    throw error;
  }
};

export const insertTicket = async (ticket) => {
  try {
    if (!ticket || typeof ticket !== 'object') {
      throw new Error('Dati biglietto non validi');
    }

    const requiredFields = ['screening_id', 'user_id', 'seat_number'];
    for (const field of requiredFields) {
      if (!ticket[field]) {
        throw new Error(`Campo obbligatorio mancante: ${field}`);
      }
    }

    // ✅ QUERY per MariaDB
    const [result] = await promisePool.execute(
      "INSERT INTO tickets (screening_id, user_id, seat_number, status, price, bookedAt) VALUES (?, ?, ?, ?, ?, ?)", 
      [
        ticket.screening_id,
        ticket.user_id,
        ticket.seat_number,
        ticket.status || 'confirmed',
        ticket.price || 0,
        ticket.bookedAt || new Date()
      ]
    );
    
    return result;
  } catch (error) {
    console.error('Errore inserimento biglietto:', error);
    throw error;
  }
};

export const getTicketsByUser = async (user_id) => {
  try {
    const userId = parseInt(user_id);
    if (!userId || userId <= 0) {
      throw new Error('ID utente non valido');
    }

    const [rows] = await promisePool.execute(
      `SELECT t.*, m.title, m.foto_locandina, s.start_time, h.name as hall_name
       FROM tickets t
       JOIN screenings s ON t.screening_id = s.id
       JOIN movies m ON s.movie_id = m.id
       JOIN halls h ON s.hall_id = h.id
       WHERE t.user_id = ?
       ORDER BY s.start_time ASC`,
      [userId]
    );
    return rows;
  } catch (error) {
    console.error('Errore recupero biglietti utente:', error);
    throw error;
  }
};

export const reserveSeats = async (screening_id, seat_numbers, user_id, discountApplied) => {
  const connection = await promisePool.getConnection();
  
  try {
    await connection.beginTransaction();

    console.log('Starting reservation:', { screening_id, seat_numbers, user_id });

    if (!validateSeatNumbers(seat_numbers)) {
      throw new Error('Formato posti non valido');
    }

    if (seat_numbers.length === 0) {
      throw new Error('Nessun posto selezionato');
    }

    const placeholders = seat_numbers.map(() => '?').join(', ');

    const [seatDetails] = await connection.execute(
      `SELECT seat_number, seat_type FROM seats 
       WHERE hall_id = (SELECT hall_id FROM screenings WHERE id = ?)
       AND seat_number IN (${placeholders})`,
      [screening_id, ...seat_numbers]
    );

    console.log('Seat details:', seatDetails);

    const [availableSeats] = await connection.execute(
      `SELECT seat_number FROM tickets 
       WHERE screening_id = ? AND seat_number IN (${placeholders}) 
       AND (status = 'confirmed' OR status = 'validated') 
       AND (reserved_until IS NULL OR reserved_until > NOW())`,
      [screening_id, ...seat_numbers]
    );

    if (availableSeats.length > 0) {
      throw new Error(`Posti già occupati: ${availableSeats.map(s => s.seat_number).join(', ')}`);
    }

    await connection.execute(
      `DELETE FROM tickets 
       WHERE screening_id = ? AND status = 'reserved' 
       AND reserved_until <= NOW()`,
      [screening_id]
    );

    const reservedUntil = new Date(Date.now() + 2 * 60 * 1000);
    
    for (const seat_number of seat_numbers) {
      const seat = seatDetails.find(s => s.seat_number === seat_number);
      const price = seat?.seat_type === 'premium' ? 10.00 : 7.50;
      const finalPrice = (() => {
        try {
          if (discountApplied && !isNaN(discountApplied) && discountApplied > 0 && discountApplied <= 100) {
            return Math.round(price * (1 - discountApplied / 100) * 100) / 100;
          }
          return price;
        } catch (error) {
          console.error('Errore nel calcolo dello sconto:', error);
          return price;
        }
      })();      
      await connection.execute(
        `INSERT INTO tickets (screening_id, user_id, seat_number, status, reserved_until, price) 
         VALUES (?, ?, ?, 'reserved', ?, ?) 
         ON DUPLICATE KEY UPDATE 
         user_id = VALUES(user_id), 
         status = VALUES(status), 
         reserved_until = VALUES(reserved_until),
         price = VALUES(price)`,
        [screening_id, user_id, seat_number, reservedUntil, finalPrice]
      );
    }

    const [ticketIds] = await connection.execute(
      `SELECT id FROM tickets 
       WHERE screening_id = ? AND user_id = ? AND seat_number IN (${placeholders})
       AND status = 'reserved'`,
      [screening_id, user_id, ...seat_numbers]
    );

    await connection.commit();
    
    return {
      success: true,
      reserved_until: reservedUntil,
      seats: seat_numbers,
      ticket_ids: ticketIds.map(t => t.id)
    };
  } catch (error) {
    await connection.rollback();
    console.error('Error in reserveSeats:', error);
    throw error;
  } finally {
    connection.release();
  }
};

export const confirmTickets = async (ticket_ids, payment_data) => {
  const connection = await promisePool.getConnection();
  
  try {
    await connection.beginTransaction();

    if (!validateTicketIds(ticket_ids)) {
      throw new Error("Formato ID ticket non valido");
    }

    const validTicketIds = ticket_ids.filter(id => id != null && id !== undefined);
    
    if (validTicketIds.length === 0) {
      throw new Error("Nessun ticket ID valido fornito");
    }

    const placeholders = validTicketIds.map(() => '?').join(', ');

    console.log('Ticket IDs da confermare:', validTicketIds);

    const [tickets] = await connection.execute(
      `SELECT id, screening_id, seat_number, price, status, reserved_until 
       FROM tickets 
       WHERE id IN (${placeholders}) AND status = 'reserved'`,
      validTicketIds
    );

    if (tickets.length !== validTicketIds.length) {
      const foundIds = tickets.map(t => t.id);
      const missingIds = validTicketIds.filter(id => !foundIds.includes(id));
      throw new Error(`Ticket non validi o già confermati: ${missingIds.join(', ')}`);
    }

    const now = new Date();
    const expiredTickets = tickets.filter(ticket => 
      new Date(ticket.reserved_until) < now
    );

    if (expiredTickets.length > 0) {
      throw new Error(`Prenotazioni scadute per i ticket: ${expiredTickets.map(t => t.id).join(', ')}`);
    }

    const paymentId = payment_data.payment_id || null;
    const qrCodeUrl = payment_data.qr_code_url || null; 
    const paymentOrderId = payment_data.payment_order_id || null;

    const updateResult = await connection.execute(
      `UPDATE tickets 
       SET status = 'confirmed', 
           reserved_until = NULL, 
           payment_id = ?, 
           qr_code_url = ?,
           bookedAt = NOW()
       WHERE id IN (${placeholders})`,
      [paymentId, qrCodeUrl, ...validTicketIds]
    );

    console.log(`Ticket aggiornati: ${updateResult[0].affectedRows}`);

    for (const ticket of tickets) {
      await connection.execute(
        `INSERT INTO payments (ticket_id, amount, payment_method, status, payment_order_id, transaction_id) 
         VALUES (?, ?, 'payment', 'completed', ?, ?)`,
        [ticket.id, ticket.price, paymentOrderId, paymentId]
      );
    }

    if (payment_data.discount_id) {
      await connection.execute(
        `UPDATE discount_codes 
         SET used = TRUE, used_by = ?, used_at = NOW() 
         WHERE id = ? AND used = FALSE`,
        [payment_data.user_id, payment_data.discount_id]
      );
    }

    const [updatedTickets] = await connection.execute(
      `SELECT t.*, m.title, m.foto_locandina, s.start_time, h.name as hall_name,
              u.name as user_name, u.email as user_email
       FROM tickets t
       JOIN screenings s ON t.screening_id = s.id
       JOIN movies m ON s.movie_id = m.id
       JOIN halls h ON s.hall_id = h.id
       JOIN users u ON t.user_id = u.id
       WHERE t.id IN (${placeholders})`,
      validTicketIds
    );

    await connection.commit();

    try {
      const totalAmount = updatedTickets.reduce((sum, ticket) => {
        return sum + Number(ticket.price || 0);
      }, 0);
      
      await sendConfirmationEmail(
        updatedTickets[0].user_email, 
        updatedTickets, 
        totalAmount, 
        qrCodeUrl
      );
    } catch (emailError) {
      console.error('Errore invio email, ma pagamento confermato:', emailError);
    }
    
    return updatedTickets;

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const cancelTicket = async (ticket_id, user_id) => {
  try {
    const ticketId = parseInt(ticket_id);
    const userId = parseInt(user_id);

    if (!ticketId || ticketId <= 0 || !userId || userId <= 0) {
      throw new Error('ID ticket o utente non valido');
    }

    const [result] = await promisePool.execute(
      `UPDATE tickets 
       SET status = 'cancelled' 
       WHERE id = ? AND user_id = ? 
       AND status = 'confirmed' 
       AND EXISTS (
         SELECT 1 FROM screenings s 
         WHERE s.id = tickets.screening_id 
         AND s.start_time > DATE_ADD(NOW(), INTERVAL 2 HOUR)
       )`,
      [ticketId, userId]
    );

    if (result.affectedRows === 0) {
      throw new Error("Impossibile cancellare: meno di 2 ore alla proiezione o prenotazione non trovata");
    }

    return result;
  } catch (error) {
    console.error('Errore cancellazione ticket:', error);
    throw error;
  }
};

export const getOccupiedSeats = async (screening_id) => {
  try {
    const screeningId = parseInt(screening_id);
    if (!screeningId || screeningId <= 0) {
      throw new Error('ID proiezione non valido');
    }

    const [rows] = await promisePool.execute(
      `SELECT seat_number FROM tickets 
       WHERE screening_id = ? AND (status = 'confirmed' OR status = 'validated')  
       AND (reserved_until IS NULL OR reserved_until > NOW())`,
      [screeningId]
    );
    return rows.map(row => row.seat_number);
  } catch (error) {
    console.error('Errore recupero posti occupati:', error);
    throw error;
  }
};

export const cleanupExpiredReservations = async () => {
  try {
    const [result] = await promisePool.execute(
      `DELETE FROM tickets 
       WHERE status = 'reserved' 
       AND reserved_until <= NOW()`
    );
    return result.affectedRows;
  } catch (error) {
    console.error('Errore pulizia prenotazioni scadute:', error);
    throw error;
  }
};