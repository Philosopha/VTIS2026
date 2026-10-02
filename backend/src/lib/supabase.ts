// ─────────────────────────────────────────────────────────────────────────────
// lib/supabase.ts — Supabase client (service role — bypasses RLS)
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js';

const url  = process.env.SUPABASE_URL!;
const key  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !key) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
}

// Service role key — keep this on the backend only, never expose to the browser
export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});
