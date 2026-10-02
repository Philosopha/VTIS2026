import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../_lib/supabase';
import { requireAuth, cors } from '../../_lib/auth';
import { generateTicketPDF, type Registration } from '../../_lib/ticket';
import { sendConfirmationEmail } from '../../_lib/email';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req, res)) return;

  const id = String(req.query.id ?? '').toUpperCase();
  const { data, error } = await supabase.from('registrations').select('*').eq('registration_id', id).maybeSingle();
  if (error || !data) return res.status(404).json({ error: 'Not found' });

  if (req.method === 'GET') return res.json(data);

  if (req.method === 'POST') {
    try {
      const reg = data as Registration;
      const pdf = await generateTicketPDF(reg);
      const result = await sendConfirmationEmail(reg, pdf);
      await supabase.from('registrations').update({ ticket_generated: true, email_sent: result.success, email_sent_at: result.success ? new Date().toISOString() : reg.email_sent_at, email_error: result.error ?? null }).eq('id', reg.id);
      return result.success ? res.json({ success: true, message: `Email resent to ${reg.email}` }) : res.status(500).json({ success: false, error: result.error });
    } catch (err) { return res.status(500).json({ error: String(err) }); }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
