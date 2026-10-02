import QRCode from 'qrcode';

export async function generateQRCode(text: string): Promise<Buffer> {
  return QRCode.toBuffer(text, {
    errorCorrectionLevel: 'H',
    type: 'png',
    margin: 2,
    width: 280,
    color: { dark: '#0b0f2e', light: '#ffffff' },
  });
}
