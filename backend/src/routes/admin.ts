// ─────────────────────────────────────────────────────────────────────────────
// routes/admin.ts — all /api/admin/* endpoints (JWT protected)
//
// GET    /api/admin/registrations          list + search + filter + paginate
// GET    /api/admin/registrations/:id      single record
// GET    /api/admin/registrations/:id/ticket  download ticket PDF
// POST   /api/admin/registrations/:id/resend  re-send confirmation email
// GET    /api/admin/stats                  summary counts
// GET    /api/admin/export                 CSV download
// ─────────────────────────────────────────────────────────────────────────────

import { Router, Response } from 'express';
import { supabase }                from '../lib/supabase';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { generateTicketPDF }       from '../services/ticket';
import { sendConfirmationEmail }   from '../services/email';
import type { Registration }       from '../types';

export const adminRouter = Router();
adminRouter.use(requireAuth);               // all admin routes require JWT

// ── helpers ───────────────────────────────────────────────────────────────────
function toCSVRow(r: Registration): string {
  const days = [r.day1 && 'Day1', r.day2 && 'Day2', r.day3 && 'Day3']
    .filter(Boolean).join('|');
  const esc = (s: string | null | undefined) =>
    `"${String(s ?? '').replace(/"/g, '""')}"`;
  return [
    esc(r.registration_id),
    esc(r.first_name),
    esc(r.last_name),
    esc(r.email),
    esc(r.profile),
    esc(days),
    esc(r.registered_at),
    esc(String(r.ticket_generated)),
    esc(String(r.email_sent)),
    esc(String(r.checked_in)),
    esc(r.checked_in_at ?? ''),
  ].join(',');
}

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
adminRouter.get('/stats', async (_req, res: Response) => {
  const { count: total }      = await supabase.from('registrations').select('*', { count: 'exact', head: true });
  const { count: emailsSent } = await supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('email_sent', true);
  const { count: checkedIn }  = await supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('checked_in', true);
  const { count: day1 }       = await supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('day1', true);
  const { count: day2 }       = await supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('day2', true);
  const { count: day3 }       = await supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('day3', true);

  res.json({ total, emailsSent, checkedIn, byDay: { day1, day2, day3 } });
});

// ── GET /api/admin/registrations ──────────────────────────────────────────────
adminRouter.get('/registrations', async (req: AuthRequest, res: Response) => {
  const {
    q       = '',
    page    = '1',
    limit   = '50',
    day,
    checked_in,
    email_sent,
    sort    = 'registered_at',
    order   = 'desc',
  } = req.query as Record<string, string>;

  const pageNum  = Math.max(1, parseInt(page,  10));
  const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10)));
  const from     = (pageNum - 1) * limitNum;
  const to       = from + limitNum - 1;

  const ALLOWED_SORT = ['registration_number', 'registered_at', 'first_name', 'last_name', 'email'];
  const safeSort  = ALLOWED_SORT.includes(sort) ? sort : 'registered_at';
  const safeOrder = order === 'asc';

  let query = supabase
    .from('registrations')
    .select('*', { count: 'exact' })
    .order(safeSort, { ascending: safeOrder })
    .range(from, to);

  // Full-text search across name, email, registration_id
  if (q.trim()) {
    const term = `%${q.trim()}%`;
    query = query.or(
      `first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term},registration_id.ilike.${term}`,
    );
  }

  if (day === '1') query = query.eq('day1', true);
  if (day === '2') query = query.eq('day2', true);
  if (day === '3') query = query.eq('day3', true);
  if (checked_in  === 'true')  query = query.eq('checked_in', true);
  if (checked_in  === 'false') query = query.eq('checked_in', false);
  if (email_sent  === 'true')  query = query.eq('email_sent', true);
  if (email_sent  === 'false') query = query.eq('email_sent', false);

  const { data, count, error } = await query;

  if (error) { res.status(500).json({ error: error.message }); return; }

  res.json({
    data,
    meta: { total: count ?? 0, page: pageNum, limit: limitNum,
            pages: Math.ceil((count ?? 0) / limitNum) },
  });
});

// ── GET /api/admin/registrations/:id ─────────────────────────────────────────
adminRouter.get('/registrations/:id', async (req, res: Response) => {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('registration_id', req.params.id.toUpperCase())
    .maybeSingle();

  if (error || !data) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(data);
});

// ── GET /api/admin/registrations/:id/ticket ───────────────────────────────────
adminRouter.get('/registrations/:id/ticket', async (req, res: Response) => {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('registration_id', req.params.id.toUpperCase())
    .maybeSingle();

  if (error || !data) { res.status(404).json({ error: 'Not found' }); return; }

  try {
    const pdf = await generateTicketPDF(data as Registration);
    const filename = `VTIS-2026-Ticket-${data.registration_id.replace(' ', '-')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdf);
  } catch (err) {
    console.error('[TICKET GEN ERROR]', err);
    res.status(500).json({ error: 'Failed to generate ticket' });
  }
});

// ── POST /api/admin/registrations/:id/resend ─────────────────────────────────
adminRouter.post('/registrations/:id/resend', async (req, res: Response) => {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('registration_id', req.params.id.toUpperCase())
    .maybeSingle();

  if (error || !data) { res.status(404).json({ error: 'Not found' }); return; }

  try {
    const reg = data as Registration;
    const pdf = await generateTicketPDF(reg);
    const emailResult = await sendConfirmationEmail(reg, pdf);

    await supabase.from('registrations').update({
      ticket_generated: true,
      email_sent:       emailResult.success,
      email_sent_at:    emailResult.success ? new Date().toISOString() : reg.email_sent_at,
      email_error:      emailResult.error ?? null,
    }).eq('id', reg.id);

    if (emailResult.success) {
      res.json({ success: true, message: `Email resent to ${reg.email}` });
    } else {
      res.status(500).json({ success: false, error: emailResult.error });
    }
  } catch (err) {
    console.error('[RESEND ERROR]', err);
    res.status(500).json({ error: 'Failed to resend' });
  }
});

// ── GET /api/admin/export  (CSV download) ─────────────────────────────────────
adminRouter.get('/export', async (req: AuthRequest, res: Response) => {
  const { q = '', day, checked_in, email_sent } = req.query as Record<string, string>;

  let query = supabase
    .from('registrations')
    .select('*')
    .order('registration_number', { ascending: true });

  if (q.trim()) {
    const term = `%${q.trim()}%`;
    query = query.or(
      `first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term},registration_id.ilike.${term}`,
    );
  }
  if (day === '1') query = query.eq('day1', true);
  if (day === '2') query = query.eq('day2', true);
  if (day === '3') query = query.eq('day3', true);
  if (checked_in === 'true')  query = query.eq('checked_in', true);
  if (checked_in === 'false') query = query.eq('checked_in', false);
  if (email_sent === 'true')  query = query.eq('email_sent', true);
  if (email_sent === 'false') query = query.eq('email_sent', false);

  const { data, error } = await query;
  if (error) { res.status(500).json({ error: error.message }); return; }

  const header = 'Registration ID,First Name,Last Name,Email,Profile,Days,Registered At,Ticket Generated,Email Sent,Checked In,Checked In At';
  const rows   = (data as Registration[]).map(toCSVRow);
  const csv    = [header, ...rows].join('\r\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="vtis-2026-registrations-${Date.now()}.csv"`);
  res.send(csv);
});
