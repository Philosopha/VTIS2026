// ─────────────────────────────────────────────────────────────────────────────
// services/ticket.ts — generate a branded PDF ticket with PDFKit
//
// Layout (A5 landscape, 595 × 420 pt):
//   Left panel  (ink bg): VTIS logo text, event name, dates
//   Right panel (white):  participant name, ID, days, QR code
// ─────────────────────────────────────────────────────────────────────────────

import PDFDocument from 'pdfkit';
import { generateQRCode } from './qrcode';
import type { Registration } from '../types';

/** Returns a PDF Buffer for the given registration */
export async function generateTicketPDF(reg: Registration): Promise<Buffer> {
  const qrBuffer = await generateQRCode(reg.registration_id);

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    // A5 landscape
    const doc = new PDFDocument({
      size: [595, 420],
      margin: 0,
      info: {
        Title: `VTIS 2026 Ticket — ${reg.registration_id}`,
        Author: 'Volta Tech & Innovation Summit',
      },
    });

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end',  () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const INK    = '#0b0f2e';
    const INK2   = '#151b3d';
    const WHITE  = '#ffffff';
    const MUTED  = '#5c6284';
    const GOLD   = '#c47a0a';
    const SURF   = '#f5f6fa';
    const BORDER = '#dde0ee';

    const W = 595, H = 420;
    const SPLIT = 210; // left panel width

    // ── Left panel: deep blue-black ─────────────────────────────────────────
    doc.rect(0, 0, SPLIT, H).fill(INK);

    // Subtle texture stripe
    doc.rect(0, 0, 4, H).fill(GOLD);

    // Event branding
    doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(22)
       .text('VTIS', 24, 40, { lineBreak: false });
    doc.fillColor(GOLD).font('Helvetica-Bold').fontSize(22)
       .text(' 2026', 24 + doc.widthOfString('VTIS'), 40, { lineBreak: false });

    doc.fillColor(WHITE).font('Helvetica').fontSize(8).opacity(0.5)
       .text('VOLTA TECH & INNOVATION SUMMIT', 24, 70, { width: SPLIT - 48, characterSpacing: 1.5 });

    doc.opacity(1);

    // Divider
    doc.moveTo(24, 88).lineTo(SPLIT - 24, 88).strokeColor(WHITE).opacity(0.15).lineWidth(0.5).stroke();
    doc.opacity(1);

    // Event details
    doc.fillColor(WHITE).opacity(0.45).font('Helvetica').fontSize(7.5)
       .text('EVENT', 24, 100, { characterSpacing: 1.5 });
    doc.opacity(1).fillColor(WHITE).font('Helvetica-Bold').fontSize(13)
       .text('Volta Tech &', 24, 112)
       .text('Innovation Summit', 24, 127);

    doc.fillColor(WHITE).opacity(0.45).font('Helvetica').fontSize(7.5)
       .text('DATE', 24, 152, { characterSpacing: 1.5 });
    doc.opacity(1).fillColor(WHITE).font('Helvetica').fontSize(10)
       .text('[Summit dates]', 24, 163);

    doc.fillColor(WHITE).opacity(0.45).font('Helvetica').fontSize(7.5)
       .text('VENUE', 24, 183, { characterSpacing: 1.5 });
    doc.opacity(1).fillColor(WHITE).font('Helvetica').fontSize(10)
       .text('Ho, Volta Region, Ghana', 24, 194);

    // Days attending
    const days: string[] = [];
    if (reg.day1) days.push('Day 1 · Altitude Conversation');
    if (reg.day2) days.push('Day 2 · The Gathering');
    if (reg.day3) days.push('Day 3 · The Laboratory');

    doc.fillColor(WHITE).opacity(0.45).font('Helvetica').fontSize(7.5)
       .text('ATTENDING', 24, 220, { characterSpacing: 1.5 });
    doc.opacity(1);
    days.forEach((d, i) => {
      doc.fillColor(WHITE).font('Helvetica').fontSize(8.5)
         .text(`• ${d}`, 24, 232 + i * 13);
    });

    // Bottom: organiser
    doc.fillColor(WHITE).opacity(0.3).font('Helvetica').fontSize(7)
       .text('Organised by Confluence', 24, H - 28, { width: SPLIT - 48 });
    doc.opacity(1);

    // ── Right panel: white ───────────────────────────────────────────────────
    doc.rect(SPLIT, 0, W - SPLIT, H).fill(WHITE);

    // Registration ID badge
    doc.rect(SPLIT + 20, 24, W - SPLIT - 40, 44).fill(SURF);
    doc.fillColor(MUTED).font('Helvetica').fontSize(7).opacity(1)
       .text('REGISTRATION ID', SPLIT + 32, 32, { characterSpacing: 1.5 });
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(22)
       .text(reg.registration_id, SPLIT + 32, 44);

    // Participant name
    doc.fillColor(MUTED).font('Helvetica').fontSize(7.5).opacity(0.7)
       .text('PARTICIPANT', SPLIT + 20, 82, { characterSpacing: 1.5 });
    doc.opacity(1).fillColor(INK).font('Helvetica-Bold').fontSize(16)
       .text(`${reg.first_name} ${reg.last_name}`, SPLIT + 20, 93, {
         width: W - SPLIT - 40,
         ellipsis: true,
       });

    // Profile
    doc.fillColor(MUTED).font('Helvetica').fontSize(7.5).opacity(0.7)
       .text('PROFILE', SPLIT + 20, 118, { characterSpacing: 1.5 });
    doc.opacity(1).fillColor(INK).font('Helvetica').fontSize(10)
       .text(reg.profile, SPLIT + 20, 129);

    // Registration date
    const regDate = new Date(reg.registered_at).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
    doc.fillColor(MUTED).font('Helvetica').fontSize(7.5).opacity(0.7)
       .text('REGISTERED', SPLIT + 20, 150, { characterSpacing: 1.5 });
    doc.opacity(1).fillColor(INK).font('Helvetica').fontSize(10)
       .text(regDate, SPLIT + 20, 161);

    // Divider
    doc.moveTo(SPLIT + 20, 182).lineTo(W - 20, 182)
       .strokeColor(BORDER).lineWidth(0.5).stroke();

    // QR code
    const QR_SIZE = 130;
    const qrX = W - QR_SIZE - 24;
    const qrY = 192;
    doc.image(qrBuffer, qrX, qrY, { width: QR_SIZE, height: QR_SIZE });

    // QR label
    doc.fillColor(MUTED).font('Helvetica').fontSize(7).opacity(0.6)
       .text('Scan to verify at entry', qrX, qrY + QR_SIZE + 4, {
         width: QR_SIZE, align: 'center',
       });

    // Ticket note
    doc.opacity(1).fillColor(MUTED).font('Helvetica').fontSize(7.5)
       .text('This ticket is personal and non-transferable.\nPresent at check-in for entry.',
         SPLIT + 20, 200, { width: qrX - SPLIT - 36 });

    // Ticket validity badge
    doc.rect(SPLIT + 20, 340, 110, 24).fill(INK);
    doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(8)
       .text('VALID TICKET', SPLIT + 26, 348, { width: 98, align: 'center' });

    // Bottom border accent
    doc.rect(SPLIT, H - 4, W - SPLIT, 4).fill(INK2);

    doc.end();
  });
}
