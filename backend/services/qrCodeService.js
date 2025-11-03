// services/qrCodeService.js

import QRCode from 'qrcode';
import { promises as fs } from 'fs';
import path from 'path';

export const generateQRCode = async (ticket_ids) => {
  try {
    // Crea directory se non esiste
    const qrDir = path.join(process.cwd(), 'public', 'qr-codes');
    await fs.mkdir(qrDir, { recursive: true });

    const qrData = {
      ticket_ids: ticket_ids,
      cinema: "Cinema API",
      generated_at: new Date().toISOString(),
      type: 'cinema_ticket'
    };

    const qrText = `${ticket_ids.join('_')}_${Date.now()}`;
    const qrFileName = `ticket_${qrText}.png`;
    const qrFilePath = path.join(qrDir, qrFileName);
    const qrCodeUrl = `/qr-codes/${qrFileName}`;

    // Genera il QR code come immagine
    await QRCode.toFile(qrFilePath, qrText, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    });

    console.log('✅ QR code generato:', qrCodeUrl);
    return qrCodeUrl;
  } catch (error) {
    console.error('❌ Errore generazione QR code:', error);
    throw new Error('Errore nella generazione del QR code');
  }
};