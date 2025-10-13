// services/emailService.js
import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.APP_PASSWORD
    }
  });
};

export const sendConfirmationEmail = async (userEmail, tickets, totalAmount) => {
  // Assicurati che totalAmount sia un numero
  const finalTotalAmount = Number(totalAmount) || 
                          tickets.reduce((sum, ticket) => sum + Number(ticket.price || 0), 0);
  
  const ticket = tickets[0];
  const screeningTime = new Date(ticket.start_time).toLocaleString('it-IT');
  
  const transporter = createTransporter();
  
  // Genera QR code URL per ogni ticket
  const qrCodesHtml = tickets.map(t => `
    <div style="text-align: center; margin: 15px; display: inline-block;">
      <p><strong>Posto ${t.seat_number}</strong></p>
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CINEMA-TICKET-${t.id}-${t.seat_number}-${t.screening_id}" 
           alt="QR Code Posto ${t.seat_number}" 
           style="max-width: 150px; border: 2px solid #333; padding: 10px; background: white;" />
    </div>
  `).join('');

  const mailOptions = {
    from: {
      name: 'Cinema API',
      address: process.env.EMAIL_USER
    },
    to: userEmail,
    subject: '🎬 Conferma Prenotazione Cinema',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 20px; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          .header { background: #e74c3c; color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .ticket-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e74c3c; }
          .qr-section { text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; }
          .footer { background: #2c3e50; color: white; padding: 20px; text-align: center; font-size: 12px; }
          .info-box { background: #fff3cd; padding: 15px; border-radius: 5px; border: 1px solid #ffeaa7; margin: 20px 0; }
          .seat-details { margin: 10px 0; padding: 10px; background: white; border-radius: 5px; border: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎬 Cinema API</h1>
            <h2>Prenotazione Confermata!</h2>
          </div>
          
          <div class="content">
            <p>Ciao <strong>${ticket.user_name || 'Cliente'}</strong>,</p>
            <p>La tua prenotazione è stata confermata con successo. Ecco i dettagli:</p>
            
            <div class="ticket-info">
              <h3>📋 Dettagli Prenotazione</h3>
              <p><strong>Film:</strong> ${ticket.title}</p>
              <p><strong>Data e Ora:</strong> ${screeningTime}</p>
              <p><strong>Sala:</strong> ${ticket.hall_name}</p>
              <p><strong>Numero Biglietti:</strong> ${tickets.length}</p>
              <p><strong>Importo Totale:</strong> €${finalTotalAmount.toFixed(2)}</p>
              <p><strong>Codice Prenotazione:</strong> #${tickets[0].id}</p>
              
              <div style="margin-top: 15px;">
                <h4>Posti Prenotati:</h4>
                ${tickets.map(t => `
                  <div class="seat-details">
                    <strong>Posto ${t.seat_number}</strong> - 
                    ${t.seat_type === 'premium' ? 'Premium' : 'Standard'} - 
                    €${Number(t.price || 0).toFixed(2)}
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="qr-section">
              <h3>📱 QR Codes per l'ingresso:</h3>
              <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 15px;">
                ${qrCodesHtml}
              </div>
              <p style="font-size: 12px; color: #666; margin-top: 15px;">
                Presenta questi QR code all'ingresso della sala
              </p>
            </div>

            <div class="info-box">
              <h4>ℹ️ Informazioni Importanti</h4>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Arriva almeno 15 minuti prima dell'inizio della proiezione</li>
                <li>Mostra il QR code corrispondente a ogni biglietto</li>
                <li>Conserva questa email come ricevuta del pagamento</li>
                <li>Per cancellazioni, contatta l'assistenza almeno 2 ore prima</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>Grazie per aver scelto il nostro cinema! 🍿</p>
            <p>Per assistenza: ${process.env.EMAIL_USER}</p>
            <p>© ${new Date().getFullYear()} Cinema API - Tutti i diritti riservati</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email di conferma inviata a:', userEmail);
    console.log('📧 Message ID:', result.messageId);
    return true;
  } catch (error) {
    console.error('❌ Errore invio email:', error);
    throw new Error(`Errore nell'invio dell'email: ${error.message}`);
  }
};