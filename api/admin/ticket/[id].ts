import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../_lib/supabase';
import { requireAuth, cors } from '../../_lib/auth';
import { generateTicketPDF, type Registration } from '../../_lib/ticket';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req, res)) return;

  const id = String(req.query.id ?? '').toUpperCase();
  const { data, error } = await supabase.from('registrations').select('*').eq('registration_id', id).maybeSingle();
  if (error || !data) return res.status(404).json({ error: 'Not found' });

  try {
    const pdf = await generateTicketPDF(data as Registration);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="VTIS-2026-Ticket-${id.replace(' ', '-')}.pdf"`);
    return res.send(pdf);
  } catch (err) { return res.status(500).json({ error: String(err) }); }
}
