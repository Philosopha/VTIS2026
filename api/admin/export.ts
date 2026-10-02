import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../lib/supabase';
import { requireAuth, cors } from '../../lib/auth';
import type { Registration } from '../../lib/ticket';

function toRow(r: Registration): string {
  const days = [r.day1 && 'Day1', r.day2 && 'Day2', r.day3 && 'Day3'].filter(Boolean).join('|');
  const esc = (s: string | null | undefined) => `"${String(s ?? '').replace(/"/g, '""')}"`;
  return [esc(r.registration_id), esc(r.first_name), esc(r.last_name), esc(r.email), esc(r.profile), esc(days), esc(r.registered_at), esc(String(r.ticket_generated)), esc(String(r.email_sent)), esc(String(r.checked_in)), esc(r.checked_in_at ?? '')].join(',');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req, res)) return;

  const { q = '', day, checked_in, email_sent } = req.query as Record<string, string>;
  let query = supabase.from('registrations').select('*').order('registration_number', { ascending: true });
  if (q.trim()) { const t = `%${q.trim()}%`; query = query.or(`first_name.ilike.${t},last_name.ilike.${t},email.ilike.${t},registration_id.ilike.${t}`); }
  if (day === '1') query = query.eq('day1', true);
  if (day === '2') query = query.eq('day2', true);
  if (day === '3') query = query.eq('day3', true);
  if (checked_in === 'true')  query = query.eq('checked_in', true);
  if (checked_in === 'false') query = query.eq('checked_in', false);
  if (email_sent === 'true')  query = query.eq('email_sent', true);
  if (email_sent === 'false') query = query.eq('email_sent', false);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  const header = 'Registration ID,First Name,Last Name,Email,Profile,Days,Registered At,Ticket Generated,Email Sent,Checked In,Checked In At';
  const csv = [header, ...(data as Registration[]).map(toRow)].join('\r\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="vtis-2026-registrations-${Date.now()}.csv"`);
  return res.send(csv);
}
