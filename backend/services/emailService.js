// services/emailService.js
import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.APP_PASSWORD
    }
  });
};

export const sendConfirmationEmail = async (userEmail, tickets, qrCodeUrl) => {
  const ticket = tickets[0];
  const screeningTime = new Date(ticket.start_time).toLocaleString('it-IT');
  
  const transporter = createTransporter();
  
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
          body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          .header { background: #e74c3c; color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .ticket-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e74c3c; }
          .qr-code { text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; }
          .footer { background: #2c3e50; color: white; padding: 20px; text-align: center; font-size: 12px; }
          .info-box { background: #fff3cd; padding: 15px; border-radius: 5px; border: 1px solid #ffeaa7; margin: 20px 0; }
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
              <h3>📋 Dettagli Biglietto</h3>
              <p><strong>Film:</strong> ${ticket.title}</p>
              <p><strong>Data e Ora:</strong> ${screeningTime}</p>
              <p><strong>Sala:</strong> ${ticket.hall_name}</p>
              <p><strong>Posti:</strong> ${tickets.map(t => t.seat_number).join(', ')}</p>
              <p><strong>Importo Totale:</strong> €${(tickets.length * 10).toFixed(2)}</p>
              <p><strong>Codice Prenotazione:</strong> #${tickets[0].id}</p>
            </div>

            <div class="qr-code">
              <p><strong>📱 QR Code per l'ingresso:</strong></p>
              <img src="${process.env.FRONTEND_URL}${qrCodeUrl}" alt="QR Code" style="max-width: 200px; border: 2px solid #333; padding: 10px; background: white;" />
              <p style="font-size: 12px; color: #666; margin-top: 10px;">Presenta questo QR code all'ingresso della sala</p>
            </div>

            <div class="info-box">
              <h4>ℹ️ Informazioni Importanti</h4>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Arriva almeno 15 minuti prima dell'inizio</li>
                <li>Mostra il QR code all'ingresso</li>
                <li>Puoi cancellare fino a 2 ore prima della proiezione</li>
                <li>Conserva questa email come ricevuta</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>Grazie per aver scelto il nostro cinema! 🍿</p>
            <p>Per assistenza: ${process.env.EMAIL_USER}</p>
            <p>© 2024 Cinema API</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email di conferma inviata a:', userEmail);
    return true;
  } catch (error) {
    console.error('❌ Errore invio email:', error);
    return false;
  }
};