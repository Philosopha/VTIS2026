// POST /api/register
// Validates input, saves to Supabase, generates ticket PDF, sends email.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { supabase } from './_lib/supabase';
import { generateTicketPDF, type Registration } from './_lib/ticket';
import { sendConfirmationEmail } from './_lib/email';
import { cors } from './_lib/auth';

const Schema = z.object({
  firstName: z.string().min(1).max(80).trim(),
  lastName:  z.string().min(1).max(80).trim(),
  email:     z.string().email().toLowerCase().trim(),
  profile:   z.string().min(1).max(100).trim(),
  days: z.object({
    day1: z.boolean(),
    day2: z.boolean(),
    day3: z.boolean(),
  }).refine(d => d.day1 || d.day2 || d.day3, { message: 'Select at least one day' }),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
  }

  const { firstName, lastName, email, profile, days } = parsed.data;

  // Duplicate check
  const { data: existing } = await supabase
    .from('registrations').select('registration_id').eq('email', email).maybeSingle();
  if (existing) {
    return res.status(409).json({ error: 'duplicate_email', message: `This email is already registered (${existing.registration_id}).` });
  }

  // Insert — DB trigger assigns sequential ID
  const { data: newReg, error: insertError } = await supabase
    .from('registrations')
    .insert({ first_name: firstName, last_name: lastName, email, profile, day1: days.day1, day2: days.day2, day3: days.day3 })
    .select().single();

  if (insertError || !newReg) {
    if (insertError?.code === '23505') {
      return res.status(409).json({ error: 'duplicate_email', message: 'This email is already registered.' });
    }
    console.error('[DB INSERT]', insertError);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }

  // Respond immediately — don't make user wait for PDF/email
  res.status(201).json({
    success: true,
    registrationId: newReg.registration_id,
    message: `Registration confirmed! Your ID is ${newReg.registration_id}. Check your inbox for your ticket.`,
  });

  // Async: generate ticket + send email + update flags
  try {
    const reg = newReg as Registration;
    const ticketPDF = await generateTicketPDF(reg);
    const emailResult = await sendConfirmationEmail(reg, ticketPDF);
    await supabase.from('registrations').update({
      ticket_generated: true,
      email_sent:       emailResult.success,
      email_sent_at:    emailResult.success ? new Date().toISOString() : null,
      email_error:      emailResult.error ?? null,
    }).eq('id', reg.id);
  } catch (err) {
    console.error('[POST-REG ERROR]', err);
  }
}
