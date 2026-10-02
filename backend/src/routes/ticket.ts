// ─────────────────────────────────────────────────────────────────────────────
// routes/ticket.ts — GET /api/ticket/:registrationId
//
// Public endpoint — no auth required.
// Generates the PDF on the fly and streams it back as a download.
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { generateTicketPDF } from '../services/ticket';
import type { Registration } from '../types';

export const ticketRouter = Router();

ticketRouter.get('/:registrationId', async (req, res) => {
  const id = req.params.registrationId.toUpperCase();

  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('registration_id', id)
    .maybeSingle();

  if (error || !data) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  try {
    const pdf = await generateTicketPDF(data as Registration);
    const filename = `VTIS-2026-Ticket-${id.replace(/\s+/g, '-')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdf.length);
    res.send(pdf);
  } catch (err) {
    console.error('[TICKET PDF ERROR]', err);
    res.status(500).json({ error: 'Failed to generate ticket' });
  }
});
