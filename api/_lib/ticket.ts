import PDFDocument from 'pdfkit';
import { generateQRCode } from './qrcode';

export interface Registration {
  id: string;
  registration_number: number;
  registration_id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile: string;
  day1: boolean;
  day2: boolean;
  day3: boolean;
  registered_at: string;
  ticket_generated: boolean;
  ticket_url: string | null;
  email_sent: boolean;
  email_sent_at: string | null;
  email_error: string | null;
  checked_in: boolean;
  checked_in_at: string | null;
}

export async function generateTicketPDF(reg: Registration): Promise<Buffer> {
  const qrBuffer = await generateQRCode(reg.registration_id);

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      size: [595, 420], margin: 0,
      info: { Title: `VTIS 2026 Ticket — ${reg.registration_id}`, Author: 'Volta Tech & Innovation Summit' },
    });
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end',  () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const INK = '#0b0f2e', INK2 = '#151b3d', WHITE = '#ffffff';
    const MUTED = '#5c6284', GOLD = '#c47a0a', SURF = '#f5f6fa', BORDER = '#dde0ee';
    const W = 595, H = 420, SPLIT = 210;

    // Left panel
    doc.rect(0, 0, SPLIT, H).fill(INK);
    doc.rect(0, 0, 4, H).fill(GOLD);

    doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(22).text('VTIS', 24, 40, { lineBreak: false });
    doc.fillColor(GOLD).font('Helvetica-Bold').fontSize(22).text(' 2026', 24 + doc.widthOfString('VTIS'), 40, { lineBreak: false });
    doc.fillColor(WHITE).font('Helvetica').fontSize(8).opacity(0.5).text('VOLTA TECH & INNOVATION SUMMIT', 24, 70, { width: SPLIT - 48, characterSpacing: 1.5 });
    doc.opacity(1);
    doc.moveTo(24, 88).lineTo(SPLIT - 24, 88).strokeColor(WHITE).opacity(0.15).lineWidth(0.5).stroke();
    doc.opacity(1);

    doc.fillColor(WHITE).opacity(0.45).font('Helvetica').fontSize(7.5).text('EVENT', 24, 100, { characterSpacing: 1.5 });
    doc.opacity(1).fillColor(WHITE).font('Helvetica-Bold').fontSize(13).text('Volta Tech &', 24, 112).text('Innovation Summit', 24, 127);

    doc.fillColor(WHITE).opacity(0.45).font('Helvetica').fontSize(7.5).text('DATE', 24, 152, { characterSpacing: 1.5 });
    doc.opacity(1).fillColor(WHITE).font('Helvetica').fontSize(10).text('[Summit dates]', 24, 163);

    doc.fillColor(WHITE).opacity(0.45).font('Helvetica').fontSize(7.5).text('VENUE', 24, 183, { characterSpacing: 1.5 });
    doc.opacity(1).fillColor(WHITE).font('Helvetica').fontSize(10).text('Ho, Volta Region, Ghana', 24, 194);

    const days: string[] = [];
    if (reg.day1) days.push('Day 1 · Altitude Conversation');
    if (reg.day2) days.push('Day 2 · The Gathering');
    if (reg.day3) days.push('Day 3 · The Laboratory');
    doc.fillColor(WHITE).opacity(0.45).font('Helvetica').fontSize(7.5).text('ATTENDING', 24, 220, { characterSpacing: 1.5 });
    doc.opacity(1);
    days.forEach((d, i) => doc.fillColor(WHITE).font('Helvetica').fontSize(8.5).text(`• ${d}`, 24, 232 + i * 13));

    doc.fillColor(WHITE).opacity(0.3).font('Helvetica').fontSize(7).text('Organised by Confluence', 24, H - 28, { width: SPLIT - 48 });
    doc.opacity(1);

    // Right panel
    doc.rect(SPLIT, 0, W - SPLIT, H).fill(WHITE);

    doc.rect(SPLIT + 20, 24, W - SPLIT - 40, 44).fill(SURF);
    doc.fillColor(MUTED).font('Helvetica').fontSize(7).opacity(1).text('REGISTRATION ID', SPLIT + 32, 32, { characterSpacing: 1.5 });
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(22).text(reg.registration_id, SPLIT + 32, 44);

    doc.fillColor(MUTED).font('Helvetica').fontSize(7.5).opacity(0.7).text('PARTICIPANT', SPLIT + 20, 82, { characterSpacing: 1.5 });
    doc.opacity(1).fillColor(INK).font('Helvetica-Bold').fontSize(16).text(`${reg.first_name} ${reg.last_name}`, SPLIT + 20, 93, { width: W - SPLIT - 40, ellipsis: true });

    doc.fillColor(MUTED).font('Helvetica').fontSize(7.5).opacity(0.7).text('PROFILE', SPLIT + 20, 118, { characterSpacing: 1.5 });
    doc.opacity(1).fillColor(INK).font('Helvetica').fontSize(10).text(reg.profile, SPLIT + 20, 129);

    const regDate = new Date(reg.registered_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.fillColor(MUTED).font('Helvetica').fontSize(7.5).opacity(0.7).text('REGISTERED', SPLIT + 20, 150, { characterSpacing: 1.5 });
    doc.opacity(1).fillColor(INK).font('Helvetica').fontSize(10).text(regDate, SPLIT + 20, 161);

    doc.moveTo(SPLIT + 20, 182).lineTo(W - 20, 182).strokeColor(BORDER).lineWidth(0.5).stroke();

    const QR_SIZE = 130, qrX = W - QR_SIZE - 24, qrY = 192;
    doc.image(qrBuffer, qrX, qrY, { width: QR_SIZE, height: QR_SIZE });
    doc.fillColor(MUTED).font('Helvetica').fontSize(7).opacity(0.6).text('Scan to verify at entry', qrX, qrY + QR_SIZE + 4, { width: QR_SIZE, align: 'center' });

    doc.opacity(1).fillColor(MUTED).font('Helvetica').fontSize(7.5).text('This ticket is personal and non-transferable.\nPresent at check-in for entry.', SPLIT + 20, 200, { width: qrX - SPLIT - 36 });
    doc.rect(SPLIT + 20, 340, 110, 24).fill(INK);
    doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(8).text('VALID TICKET', SPLIT + 26, 348, { width: 98, align: 'center' });
    doc.rect(SPLIT, H - 4, W - SPLIT, 4).fill(INK2);

    doc.end();
  });
}
