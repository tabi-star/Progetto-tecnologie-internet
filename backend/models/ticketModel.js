// models/ticketModel.js
import db from "../db.js";
import { promisePool } from "../db.js";
import { sendConfirmationEmail } from '../services/emailService.js';

// FUNZIONE MANCANTE AGGIUNTA
export const checkTicketsStatus = async (ticket_ids) => {
  if (!ticket_ids || ticket_ids.length === 0) {
    return [];
  }
  
  const placeholders = ticket_ids.map(() => '?').join(', ');
  
  const [tickets] = await promisePool.execute(
    `SELECT id, status, reserved_until 
     FROM tickets 
     WHERE id IN (${placeholders})`,
    ticket_ids
  );
  
  return tickets;
};

export const getAllTickets = (cb) => {
  db.query(`
    SELECT t.*, m.title, s.start_time, h.name as hall_name, u.name as user_name
    FROM tickets t
    JOIN screenings s ON t.screening_id = s.id
    JOIN movies m ON s.movie_id = m.id
    JOIN halls h ON s.hall_id = h.id
    JOIN users u ON t.user_id = u.id
    ORDER BY t.bookedAt DESC
  `, cb);
};

export const insertTicket = (ticket, cb) => {
  db.query("INSERT INTO tickets SET ?", ticket, cb);
};

export const getTicketsByUser = async (user_id) => {
  const [rows] = await promisePool.execute(
    `SELECT t.*, m.title, m.foto_locandina, s.start_time, h.name as hall_name
     FROM tickets t
     JOIN screenings s ON t.screening_id = s.id
     JOIN movies m ON s.movie_id = m.id
     JOIN halls h ON s.hall_id = h.id
     WHERE t.user_id = ? AND (t.status = 'confirmed' OR t.status = 'validated')
     ORDER BY s.start_time DESC`,
    [user_id]
  );
  return rows;
};

export const reserveSeats = async (screening_id, seat_numbers, user_id) => {
  const connection = await promisePool.getConnection();
  
  try {
    await connection.beginTransaction();

    console.log('Starting reservation:', { screening_id, seat_numbers, user_id });

    if (seat_numbers.length === 0) {
      throw new Error('Nessun posto selezionato');
    }

    // Crea placeholder dinamicamente per IN clause
    const placeholders = seat_numbers.map(() => '?').join(', ');

    // Prima ottieni i dettagli dei posti
    const [seatDetails] = await connection.execute(
      `SELECT seat_number, seat_type FROM seats 
       WHERE hall_id = (SELECT hall_id FROM screenings WHERE id = ?)
       AND seat_number IN (${placeholders})`,
      [screening_id, ...seat_numbers]
    );

    console.log('Seat details:', seatDetails);

    // Verifica che i posti siano ancora disponibili
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

    // Rimuovi prenotazioni scadute
    await connection.execute(
      `DELETE FROM tickets 
       WHERE screening_id = ? AND status = 'reserved' 
       AND reserved_until <= NOW()`,
      [screening_id]
    );

    // Inserisci nuove prenotazioni
    const reservedUntil = new Date(Date.now() + 2 * 60 * 1000);
    
    for (const seat_number of seat_numbers) {
      const seat = seatDetails.find(s => s.seat_number === seat_number);
      const price = seat?.seat_type === 'premium' ? 10.00 : 7.50;
      
      await connection.execute(
        `INSERT INTO tickets (screening_id, user_id, seat_number, status, reserved_until, price) 
         VALUES (?, ?, ?, 'reserved', ?, ?) 
         ON DUPLICATE KEY UPDATE 
         user_id = VALUES(user_id), 
         status = VALUES(status), 
         reserved_until = VALUES(reserved_until),
         price = VALUES(price)`,
        [screening_id, user_id, seat_number, reservedUntil, price]
      );
    }

    // Ottieni gli ID dei ticket
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

    // Filtra e valida i ticket_ids
    const validTicketIds = ticket_ids.filter(id => id != null && id !== undefined);
    
    if (validTicketIds.length === 0) {
      throw new Error("Nessun ticket ID valido fornito");
    }

    // Crea placeholder dinamicamente per IN clause
    const placeholders = validTicketIds.map(() => '?').join(', ');

    console.log('Ticket IDs da confermare:', validTicketIds);

    // VERIFICA 1: Controlla che i ticket esistano e siano nello stato "reserved"
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

    // VERIFICA 2: Controlla che le prenotazioni non siano scadute
    const now = new Date();
    const expiredTickets = tickets.filter(ticket => 
      new Date(ticket.reserved_until) < now
    );

    if (expiredTickets.length > 0) {
      throw new Error(`Prenotazioni scadute per i ticket: ${expiredTickets.map(t => t.id).join(', ')}`);
    }

    // Prepara i dati per l'update - gestisci valori undefined
    const paymentId = payment_data.payment_id || null;
    const qrCodeUrl = payment_data.qr_code_url || null; 
    const paypalOrderId = payment_data.paypal_order_id || null;

    // AGGIORNA i biglietti a confermati
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

    // Inserisci record pagamento per ogni ticket
    for (const ticket of tickets) {
      await connection.execute(
        `INSERT INTO payments (ticket_id, amount, payment_method, status, paypal_order_id, transaction_id) 
         VALUES (?, ?, 'paypal', 'completed', ?, ?)`,
        [ticket.id, ticket.price, paypalOrderId, paymentId]
      );
    }

    // Se c'è uno sconto applicato, aggiorna la tabella discount_codes
    if (payment_data.discount_id) {
      await connection.execute(
        `UPDATE discount_codes 
         SET used = TRUE, used_by = ?, used_at = NOW() 
         WHERE id = ? AND used = FALSE`,
        [payment_data.user_id, payment_data.discount_id]
      );
    }

    // Ottieni i ticket aggiornati con tutte le informazioni
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

    // ✅ INVIA EMAIL CON IL QR CODE CORRETTO
    try {
      const totalAmount = updatedTickets.reduce((sum, ticket) => {
        return sum + Number(ticket.price || 0);
      }, 0);
      
      await sendConfirmationEmail(
        updatedTickets[0].user_email, 
        updatedTickets, 
        totalAmount, 
        qrCodeUrl // ✅ PASSIAMO IL QR CODE URL
      );
    } catch (emailError) {
      console.error('⚠️ Errore invio email, ma pagamento confermato:', emailError);
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
    [ticket_id, user_id]
  );

  if (result.affectedRows === 0) {
    throw new Error("Impossibile cancellare: meno di 2 ore alla proiezione o prenotazione non trovata");
  }

  return result;
};

// Funzione helper per ottenere i posti occupati per una proiezione
export const getOccupiedSeats = async (screening_id) => {
  const [rows] = await promisePool.execute(
    `SELECT seat_number FROM tickets 
     WHERE screening_id = ? AND (status = 'confirmed' OR status = 'validated')  
     AND (reserved_until IS NULL OR reserved_until > NOW())`,
    [screening_id]
  );
  return rows.map(row => row.seat_number);
};

// Funzione per pulire le prenotazioni scadute
export const cleanupExpiredReservations = async () => {
  const [result] = await promisePool.execute(
    `DELETE FROM tickets 
     WHERE status = 'reserved' 
     AND reserved_until <= NOW()`
  );
  return result.affectedRows;
};