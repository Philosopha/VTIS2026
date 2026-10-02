// ─────────────────────────────────────────────────────────────────────────────
// routes/verify.ts — GET /api/verify/:registrationId
// Used by QR scanner at check-in. Returns participant info and marks as checked in.
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { requireAuth } from '../middleware/auth';

export const verifyRouter = Router();

// GET /api/verify/:registrationId  — look up a ticket
verifyRouter.get('/:registrationId', requireAuth, async (req, res) => {
  const id = req.params.registrationId.toUpperCase();

  const { data, error } = await supabase
    .from('registrations')
    .select('registration_id,first_name,last_name,profile,day1,day2,day3,registered_at,checked_in,checked_in_at,ticket_generated')
    .eq('registration_id', id)
    .maybeSingle();

  if (error || !data) {
    res.status(404).json({ valid: false, error: 'Ticket not found' });
    return;
  }

  res.json({
    valid:           true,
    registrationId:  data.registration_id,
    name:            `${data.first_name} ${data.last_name}`,
    profile:         data.profile,
    days: {
      day1: data.day1,
      day2: data.day2,
      day3: data.day3,
    },
    registeredAt:    data.registered_at,
    checkedIn:       data.checked_in,
    checkedInAt:     data.checked_in_at,
    ticketGenerated: data.ticket_generated,
  });
});

// POST /api/verify/:registrationId/checkin — mark as checked in
verifyRouter.post('/:registrationId/checkin', requireAuth, async (req, res) => {
  const id = req.params.registrationId.toUpperCase();

  const { data: existing } = await supabase
    .from('registrations')
    .select('registration_id,checked_in,first_name,last_name')
    .eq('registration_id', id)
    .maybeSingle();

  if (!existing) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  if (existing.checked_in) {
    res.status(409).json({
      error:          'already_checked_in',
      message:        `${existing.first_name} ${existing.last_name} has already been checked in.`,
      registrationId: existing.registration_id,
    });
    return;
  }

  await supabase
    .from('registrations')
    .update({ checked_in: true, checked_in_at: new Date().toISOString() })
    .eq('registration_id', id);

  res.json({
    success:        true,
    message:        `${existing.first_name} ${existing.last_name} checked in successfully.`,
    registrationId: existing.registration_id,
  });
});
