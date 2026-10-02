import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({
    ok: true,
    time: new Date().toISOString(),
    env: {
      hasSupabaseUrl:  !!process.env.SUPABASE_URL,
      hasSupabaseKey:  !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasJwtSecret:    !!process.env.JWT_SECRET,
      hasResendKey:    !!process.env.RESEND_API_KEY,
      allowSeed:       process.env.ALLOW_SEED,
    },
  });
}
