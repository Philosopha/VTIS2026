import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../lib/supabase';
import { requireAuth, cors } from '../../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req, res)) return;

  const { q = '', page = '1', limit = '50', day, checked_in, email_sent, sort = 'registration_number', order = 'desc' } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10)));
  const from = (pageNum - 1) * limitNum;
  const ALLOWED_SORT = ['registration_number', 'registered_at', 'first_name', 'last_name', 'email'];
  const safeSort = ALLOWED_SORT.includes(sort) ? sort : 'registration_number';

  let query = supabase.from('registrations').select('*', { count: 'exact' }).order(safeSort, { ascending: order === 'asc' }).range(from, from + limitNum - 1);
  if (q.trim()) { const t = `%${q.trim()}%`; query = query.or(`first_name.ilike.${t},last_name.ilike.${t},email.ilike.${t},registration_id.ilike.${t}`); }
  if (day === '1') query = query.eq('day1', true);
  if (day === '2') query = query.eq('day2', true);
  if (day === '3') query = query.eq('day3', true);
  if (checked_in === 'true')  query = query.eq('checked_in', true);
  if (checked_in === 'false') query = query.eq('checked_in', false);
  if (email_sent === 'true')  query = query.eq('email_sent', true);
  if (email_sent === 'false') query = query.eq('email_sent', false);

  const { data, count, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ data, meta: { total: count ?? 0, page: pageNum, limit: limitNum, pages: Math.ceil((count ?? 0) / limitNum) } });
}
