import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

export interface JwtPayload { adminId: string; email: string; }

/** Returns the decoded JWT payload or sends 401 and returns null. */
export function requireAuth(
  req: VercelRequest,
  res: VercelResponse,
): JwtPayload | null {
  // Accept token from Authorization header OR ?token= query param (needed for CSV download links)
  const header = req.headers.authorization;
  const queryToken = typeof req.query.token === 'string' ? req.query.token : null;
  const raw = header?.startsWith('Bearer ') ? header.slice(7) : queryToken;

  if (!raw) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  try {
    return jwt.verify(raw, process.env.JWT_SECRET!) as JwtPayload;
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
    return null;
  }
}

/** Standard CORS headers — applied to every response. */
export function cors(res: VercelResponse) {
  const origins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    process.env.ADMIN_URL    || 'http://localhost:5174',
  ];
  // Vercel sets the actual Origin header; we allow all configured origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  void origins; // referenced for future per-origin checks
}
