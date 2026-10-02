// ─────────────────────────────────────────────────────────────────────────────
// services/qrcode.ts — generate QR code as a PNG Buffer
// ─────────────────────────────────────────────────────────────────────────────

import QRCode from 'qrcode';

/**
 * Returns a PNG buffer of a QR code encoding the given text.
 * Used to embed the registration ID on the ticket.
 */
export async function generateQRCode(text: string): Promise<Buffer> {
  return QRCode.toBuffer(text, {
    errorCorrectionLevel: 'H',
    type: 'png',
    margin: 2,
    width: 280,
    color: {
      dark: '#0b0f2e',  // vtis-ink
      light: '#ffffff',
    },
  });
}
