// ─────────────────────────────────────────────────────────────────────────────
// routes/registration.ts — POST /api/register
//
// Flow:
//   1. Validate input with Zod
//   2. Check for duplicate email (unique constraint in DB also catches this)
//   3. Insert into Supabase → trigger assigns sequential registration_number
//   4. Generate PDF ticket + QR code
//   5. Send confirmation email via Resend
//   6. Update ticket_generated / email_sent flags
//   7. Return registration ID to frontend
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { generateTicketPDF } from '../services/ticket';
import { sendConfirmationEmail } from '../services/email';
import type { Registration } from '../types';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export const registrationRouter = Router();

// ── Validation schema ─────────────────────────────────────────────────────────
const RegistrationSchema = z.object({
  firstName: z.string().min(1).max(80).trim(),
  lastName:  z.string().min(1).max(80).trim(),
  email:     z.string().email().toLowerCase().trim(),
  profile:   z.string().min(1).max(100).trim(),
  days: z.object({
    day1: z.boolean(),
    day2: z.boolean(),
    day3: z.boolean(),
  }).refine(d => d.day1 || d.day2 || d.day3, {
    message: 'At least one day must be selected',
  }),
});

// ── POST /api/register ────────────────────────────────────────────────────────
registrationRouter.post('/', async (req, res) => {
  // 1. Validate
  const parsed = RegistrationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Validation failed',
      details: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { firstName, lastName, email, profile, days } = parsed.data;

  // 2. Check for duplicate email before insert (friendlier error message)
  const { data: existing } = await supabase
    .from('registrations')
    .select('registration_id')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    res.status(409).json({
      error: 'duplicate_email',
      message: `This email address is already registered (${existing.registration_id}).`,
    });
    return;
  }

  // 3. Insert — trigger auto-assigns registration_number + registration_id
  const { data: newReg, error: insertError } = await supabase
    .from('registrations')
    .insert({
      first_name: firstName,
      last_name:  lastName,
      email,
      profile,
      day1: days.day1,
      day2: days.day2,
      day3: days.day3,
    })
    .select()
    .single();

  if (insertError || !newReg) {
    // Handle race-condition duplicate (unique constraint violation)
    if (insertError?.code === '23505') {
      res.status(409).json({
        error: 'duplicate_email',
        message: 'This email address is already registered.',
      });
      return;
    }
    console.error('[DB INSERT ERROR]', insertError);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
    return;
  }

  const reg = newReg as Registration;

  // 4 & 5. Generate ticket PDF and send email (non-blocking for the response)
  // We respond immediately so the user isn't waiting on PDF/email generation
  res.status(201).json({
    success: true,
    registrationId: reg.registration_id,
    message: `Registration confirmed! Your ID is ${reg.registration_id}. Check your inbox for your ticket.`,
  });

  // Async post-processing
  try {
    // 4. Generate PDF (to confirm it works and mark ticket_generated)
    await generateTicketPDF(reg);

    // Build the public ticket download URL
    const ticketUrl = `${BACKEND_URL}/api/ticket/${encodeURIComponent(reg.registration_id)}`;

    // 5. Send email with ticket link
    const emailResult = await sendConfirmationEmail(reg, ticketUrl);

    // 6. Update status flags
    await supabase
      .from('registrations')
      .update({
        ticket_generated: true,
        ticket_url:        ticketUrl,
        email_sent:        emailResult.success,
        email_sent_at:     emailResult.success ? new Date().toISOString() : null,
        email_error:       emailResult.error   ?? null,
      })
      .eq('id', reg.id);

    if (!emailResult.success) {
      console.error(`[EMAIL FAILED] ${reg.registration_id}: ${emailResult.error}`);
    }
  } catch (err) {
    console.error(`[POST-REGISTRATION ERROR] ${reg.registration_id}:`, err);
  }
});
