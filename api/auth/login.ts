// POST /api/auth/login

import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../_lib/supabase';
import { cors } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const { data: admin } = await supabase
    .from('admin_users').select('id,email,name,password_hash').eq('email', String(email).toLowerCase()).maybeSingle();

  if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  await supabase.from('admin_users').update({ last_login: new Date().toISOString() }).eq('id', admin.id);

  const token = jwt.sign({ adminId: admin.id, email: admin.email }, process.env.JWT_SECRET!, { expiresIn: '12h' });
  return res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name } });
}
