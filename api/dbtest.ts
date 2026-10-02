import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_lib/supabase';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const { count, error } = await supabase
      .from('admin_users')
      .select('*', { count: 'exact', head: true });
    if (error) return res.json({ ok: false, error: error.message });
    return res.json({ ok: true, adminCount: count });
  } catch (err: unknown) {
    return res.json({ ok: false, error: String(err) });
  }
}
