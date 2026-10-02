// POST /api/auth/seed-admin — one-time use to create the first admin.
// Set ALLOW_SEED=true in Vercel env vars, hit this once, then remove it.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { supabase } from '../_lib/supabase';
import { cors } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (process.env.ALLOW_SEED !== 'true') {
    return res.status(403).json({ error: 'Seeding disabled. Set ALLOW_SEED=true to enable.' });
  }

  const { email, password, name } = req.body || {};
  if (!email || !password || !name) return res.status(400).json({ error: 'email, password, name required' });

  const hash = await bcrypt.hash(password, 12);
  const { data, error } = await supabase
    .from('admin_users').insert({ email: String(email).toLowerCase(), password_hash: hash, name })
    .select('id,email,name').single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ message: 'Admin created. Remove ALLOW_SEED now.', admin: data });
}
