import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';
import { requireAuth, cors } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req, res)) return;

  const [total, emailsSent, checkedIn, day1, day2, day3] = await Promise.all([
    supabase.from('registrations').select('*', { count: 'exact', head: true }),
    supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('email_sent', true),
    supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('checked_in', true),
    supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('day1', true),
    supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('day2', true),
    supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('day3', true),
  ]);

  return res.json({ total: total.count ?? 0, emailsSent: emailsSent.count ?? 0, checkedIn: checkedIn.count ?? 0, byDay: { day1: day1.count ?? 0, day2: day2.count ?? 0, day3: day3.count ?? 0 } });
}
