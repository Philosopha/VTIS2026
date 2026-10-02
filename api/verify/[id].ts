// GET  /api/verify/:id  — look up ticket
// POST /api/verify/:id  — check in (body: { action: 'checkin' })

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';
import { requireAuth, cors } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req, res)) return;

  const id = String(req.query.id ?? '').toUpperCase();

  const { data, error } = await supabase
    .from('registrations')
    .select('registration_id,first_name,last_name,profile,day1,day2,day3,registered_at,checked_in,checked_in_at,ticket_generated')
    .eq('registration_id', id).maybeSingle();

  if (error || !data) return res.status(404).json({ valid: false, error: 'Ticket not found' });

  // GET — return lookup result
  if (req.method === 'GET') {
    return res.json({
      valid: true,
      registrationId: data.registration_id,
      name: `${data.first_name} ${data.last_name}`,
      profile: data.profile,
      days: { day1: data.day1, day2: data.day2, day3: data.day3 },
      registeredAt: data.registered_at,
      checkedIn: data.checked_in,
      checkedInAt: data.checked_in_at,
      ticketGenerated: data.ticket_generated,
    });
  }

  // POST — check in
  if (req.method === 'POST') {
    if (data.checked_in) {
      return res.status(409).json({
        error: 'already_checked_in',
        message: `${data.first_name} ${data.last_name} has already been checked in.`,
        registrationId: data.registration_id,
      });
    }
    await supabase.from('registrations')
      .update({ checked_in: true, checked_in_at: new Date().toISOString() })
      .eq('registration_id', id);

    return res.json({
      success: true,
      message: `${data.first_name} ${data.last_name} checked in successfully.`,
      registrationId: data.registration_id,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
