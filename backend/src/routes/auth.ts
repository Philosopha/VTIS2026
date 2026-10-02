// ─────────────────────────────────────────────────────────────────────────────
// routes/auth.ts — POST /api/auth/login  POST /api/auth/create-admin
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { requireAuth, type AuthRequest } from '../middleware/auth';

export const authRouter = Router();

const LoginSchema = z.object({
  email:    z.string().email().toLowerCase().trim(),
  password: z.string().min(8),
});

// POST /api/auth/login
authRouter.post('/login', async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid credentials' });
    return;
  }

  const { email, password } = parsed.data;

  const { data: admin } = await supabase
    .from('admin_users')
    .select('id, email, name, password_hash')
    .eq('email', email)
    .maybeSingle();

  if (!admin) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  // Update last_login
  await supabase.from('admin_users').update({ last_login: new Date().toISOString() }).eq('id', admin.id);

  const token = jwt.sign(
    { adminId: admin.id, email: admin.email },
    process.env.JWT_SECRET!,
    { expiresIn: '12h' },
  );

  res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name } });
});

// POST /api/auth/create-admin  (protected — only existing admins can create new ones)
// First admin: temporarily remove requireAuth, create the admin, then re-add it.
authRouter.post('/create-admin', requireAuth, async (req: AuthRequest, res) => {
  const Schema = z.object({
    email:    z.string().email().toLowerCase().trim(),
    password: z.string().min(8),
    name:     z.string().min(1).max(100).trim(),
  });

  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }

  const { email, password, name } = parsed.data;
  const hash = await bcrypt.hash(password, 12);

  const { data, error } = await supabase
    .from('admin_users')
    .insert({ email, password_hash: hash, name })
    .select('id, email, name')
    .single();

  if (error) {
    res.status(error.code === '23505' ? 409 : 500)
       .json({ error: error.code === '23505' ? 'Email already exists' : 'Failed to create admin' });
    return;
  }

  res.status(201).json({ admin: data });
});

// POST /api/auth/seed-admin — one-time use to create the FIRST admin
// Disable or delete this route after first use!
authRouter.post('/seed-admin', async (req, res) => {
  if (process.env.ALLOW_SEED !== 'true') {
    res.status(403).json({ error: 'Seeding disabled. Set ALLOW_SEED=true in .env to enable.' });
    return;
  }

  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    res.status(400).json({ error: 'email, password, and name are required' });
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  const { data, error } = await supabase
    .from('admin_users')
    .insert({ email, password_hash: hash, name })
    .select('id, email, name')
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(201).json({ message: 'Admin created. Disable ALLOW_SEED now.', admin: data });
});
