import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { supabase } from '../../lib/supabase';
import { cors } from '../../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (process.env.ALLOW_SEED !== 'true') return res.status(403).json({ error: 'Seeding disabled.' });

  const { email, password, name } = req.body || {};
  if (!email || !password || !name) return res.status(400).json({ error: 'email, password, name required' });

  const hash = await bcrypt.hash(password, 12);
  const { data, error } = await supabase.from('admin_users').insert({ email: String(email).toLowerCase(), password_hash: hash, name }).select('id,email,name').single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ message: 'Admin created. Set ALLOW_SEED=false now.', admin: data });
}
