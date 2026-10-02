// ─────────────────────────────────────────────────────────────────────────────
// index.ts — Express server entry point
// ─────────────────────────────────────────────────────────────────────────────

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { registrationRouter } from './routes/registration';
import { adminRouter }        from './routes/admin';
import { authRouter }         from './routes/auth';
import { verifyRouter }       from './routes/verify';
import { ticketRouter }       from './routes/ticket';

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    process.env.ADMIN_URL    || 'http://localhost:5174',
  ],
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
// Registration: max 5 submissions per IP per 15 minutes
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many registration attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin: max 100 requests per IP per minute
const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/register', registrationLimiter, registrationRouter);
app.use('/api/auth',     authRouter);
app.use('/api/admin',    adminLimiter, adminRouter);
app.use('/api/verify',   verifyRouter);
app.use('/api/ticket',   ticketRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`VTIS backend running on port ${PORT}`);
});

export default app;
