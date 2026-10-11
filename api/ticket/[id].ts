// ─────────────────────────────────────────────────────────────────────────────
// api/ticket/[id].ts — GET /api/ticket/:id
// Public endpoint — no auth required.
// Generates the PDF ticket on the fly and streams it as a download.
// ─────────────────────────────────────────────────────────────────────────────

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';
import { generateTicketPDF, type Registration } from '../_lib/ticket';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const id = String(req.query.id ?? '').toUpperCase().trim();
  if (!id) return res.status(400).json({ error: 'Registration ID is required' });

  // Fetch registration from Supabase
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('registration_id', id)
    .maybeSingle();

  if (error || !data) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  try {
    const pdf = await generateTicketPDF(data as Registration);
    const filename = `VTIS-2026-Ticket-${id.replace(/\s+/g, '-')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdf.length);
    return res.send(pdf);
  } catch (err) {
    console.error('[TICKET PDF ERROR]', err);
    return res.status(500).json({ error: 'Failed to generate ticket' });
  }
}
